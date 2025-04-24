from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI
import base64
import json
from datetime import datetime
from supabase import create_client, Client
from .models import Token, User, Flashcard, FlashcardSet, FlashcardResponse, Register
from .prompts import TRANSCRIPT_PROMPT, FLASHCARD_PROMPT

load_dotenv()


supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "https://flashcard-maker-lyart.vercel.app,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def image_to_base64(image_bytes):
    return base64.b64encode(image_bytes).decode("utf-8")

def make_transcript_prompt(text_content, images):
    messages = [
        {
            "role": "user",
            "content": []
        }
    ]
    
    messages[0]["content"].append({
        "type": "text",
        "text": text_content
    })
    
    for image in images:
        base64_image = image_to_base64(image)
        messages[0]["content"].append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
        })
    
    return messages

def make_flashcard_prompt(content):
    return {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": FLASHCARD_PROMPT.format(CONTENT=content),
            },
        ],
    }

async def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication scheme")
    token = authorization.split(" ")[1]
    try:
        res = supabase.auth.get_user(token)
        usr = res.user
        return User(id=usr.id, username=usr.user_metadata.get('username', ''))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    try:
        resp = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        # Check for error in response
        if hasattr(resp, 'error') and resp.error:
            error_msg = getattr(resp.error, 'message', 'Invalid credentials')
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)
        
        session = resp.session
        if not session or not session.access_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session returned")
        
        return {"access_token": session.access_token, "token_type": "bearer"}
    except Exception as e:
        # Log the actual exception for debugging
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Login failed: {str(e)}")

@app.get("/users/me", response_model=User) # Use imported User
async def read_users_me(current_user: User = Depends(get_current_user)): # Use imported User
    return current_user

@app.post("/register") # No response model needed here usually
async def register_user(data: Register): # Use imported Register
    try:
        # The updated Supabase syntax for sign_up
        resp = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {
                "data": {
                    "username": data.username
                }
            }
        })
        
        if resp.user:
            return {"message": "User registered. Please check email to confirm."}
        else:
            err = getattr(resp, 'error', None)
            detail = err.message if err else 'Registration failed'
            raise HTTPException(status_code=400, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload", response_model=FlashcardResponse)
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check that files were provided
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files were uploaded")
        
        # Read all uploaded images with error handling
        images = []
        for file in files:
            try:
                # Check if the file is an image
                content_type = file.content_type
                if not content_type or not content_type.startswith('image/'):
                    raise ValueError(f"File {file.filename} is not an image")
                
                # Read file content
                content = await file.read()
                if len(content) == 0:
                    raise ValueError(f"File {file.filename} is empty")
                
                images.append(content)
                print(f"Successfully read image: {file.filename}, size: {len(content)} bytes")
            except Exception as e:
                print(f"Error reading file {file.filename}: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error processing file {file.filename}: {str(e)}")
        
        print(f"Total images processed: {len(images)}")
        
        # Get transcription from OpenAI
        try:
            transcript_prompt = make_transcript_prompt(TRANSCRIPT_PROMPT, images)
            print("Sending request to OpenAI for transcription")
            transcription = client.chat.completions.create(
                messages=transcript_prompt,
                model="gpt-4o",
                max_tokens=1024
            )
            
            # Extract transcription content
            content = transcription.choices[0].message.content
            print(f"Received transcription: {content[:100]}...")
        except Exception as e:
            print(f"OpenAI transcription error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error with OpenAI transcription: {str(e)}")
        
        # Generate flashcards with error handling
        try:
            flashcard_prompt = make_flashcard_prompt(content)
            flashcards = client.chat.completions.create(
                model="gpt-4o",
                messages=[flashcard_prompt],
                temperature=0.3,
                max_tokens=1024
            )
            
            # Parse flashcards JSON
            flashcards_json = flashcards.choices[0].message.content
            if flashcards_json.startswith('```json'):
                flashcards_json = flashcards_json[7:-3]  # Remove ```json and ```
            
            # Validate JSON
            try:
                flashcards_data = json.loads(flashcards_json)
                print(f"Successfully parsed {len(flashcards_data)} flashcards")
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}, content: {flashcards_json[:100]}...")
                raise HTTPException(status_code=500, detail="Failed to parse flashcards data")
        except Exception as e:
            print(f"OpenAI flashcard generation error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")
        
        return FlashcardResponse(
            transcription=content,
            flashcards=[Flashcard(**card) for card in flashcards_data]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in upload_images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/flashcard-sets", response_model=List[FlashcardSet]) # Use imported FlashcardSet
async def get_flashcard_sets(current_user: User = Depends(get_current_user)): # Use imported User
    try:
        # Fetch sets with their flashcards
        result = supabase.table('flashcard_sets').select(
            'id, title, description, owner_id, flashcards(id, front, back)'
        ).eq('owner_id', current_user.id).execute()
        
        if not result.data:
            return []
            
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/flashcard-sets/{set_id}", response_model=FlashcardSet) # Use imported FlashcardSet
async def get_flashcard_set(
    set_id: int,
    current_user: User = Depends(get_current_user) # Use imported User
):
    try:
        # Fetch set with its flashcards
        result = supabase.table('flashcard_sets').select(
            'id, title, description, owner_id, flashcards(id, front, back)'
        ).eq('id', set_id).eq('owner_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/flashcard-sets/{set_id}")
async def delete_flashcard_set(
    set_id: int,
    current_user: User = Depends(get_current_user) # Use imported User
):
    try:
        # Delete the set (cascade delete will handle flashcards)
        result = supabase.table('flashcard_sets').delete().eq('id', set_id).eq('owner_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        
        return {"message": "Flashcard set deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/flashcard-sets/{set_id}")
async def update_flashcard_set(
    set_id: int,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        # Update the set
        result = supabase.table('flashcard_sets').update(data).eq('id', set_id).eq('owner_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Flashcard set not found")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/flashcard-sets", response_model=FlashcardSet)
async def create_flashcard_set(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        # Create the flashcard set
        set_data = {
            "title": data.get("title"),
            "description": data.get("description"),
            "owner_id": current_user.id
        }
        
        set_result = supabase.table('flashcard_sets').insert(set_data).execute()
        if not set_result.data:
            raise HTTPException(status_code=500, detail="Failed to create flashcard set")
        
        new_set_id = set_result.data[0]['id']
        
        # Create flashcards
        cards_to_insert = [
            {
                "front": card["front"],
                "back": card["back"],
                "set_id": new_set_id
            } for card in data.get("cards", [])
        ]
        
        if cards_to_insert:
            cards_result = supabase.table('flashcards').insert(cards_to_insert).execute()
            if not cards_result.data:
                # Delete the set if cards insertion fails
                supabase.table('flashcard_sets').delete().eq('id', new_set_id).execute()
                raise HTTPException(status_code=500, detail="Failed to create flashcards")
        
        # Fetch the created set with its flashcards
        result = supabase.table('flashcard_sets').select(
            'id, title, description, owner_id, flashcards(id, front, back)'
        ).eq('id', new_set_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to fetch created flashcard set")
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Flashcard Maker API is running"}