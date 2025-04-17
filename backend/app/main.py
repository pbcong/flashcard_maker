from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from dotenv import load_dotenv
from openai import OpenAI
import base64
import json
from .models import Flashcard, FlashcardResponse

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Transcription prompt
TRANSCRIPT_PROMPT = """You will be given an image containing text in various languages. Your task is to transcribe all the content in the image accurately.

Please follow these instructions carefully:

1. Examine the image closely and identify all text present.

2. The text in the image may be in Vietnamese, Chinese, or English. Be prepared to recognize and transcribe text in any of these languages.

3. Transcribe all the text you see in the image, regardless of its language. Do not translate the text; transcribe it in its original language.

4. Maintain the original formatting of the text as much as possible. This includes:
   - Preserving line breaks
   - Keeping text in the same order as it appears in the image
   - Noting any special formatting (e.g., bold, italic, underlined) if it's significant

5. If there are any symbols, numbers, or punctuation marks in the image, include them in your transcription.

6. If any part of the text is unclear or illegible, indicate this by writing [unclear] in place of the unreadable text.

7. Do not include any interpretation or analysis of the text; simply transcribe what you see.

8. Enclose your entire transcription within <transcription> tags.

Please proceed with the transcription based on the provided image."""

# Flashcard prompt template
FLASHCARD_PROMPT = '''You are an expert in creating Chinese language learning flashcards. Your task is to generate flashcards from the given Chinese content and output them in JSON format. Here's the content you'll be working with:

<chinese_content>
{CONTENT}
</chinese_content>

Create the flashcards following these guidelines:

1. For each flashcard:
   - Set the "front" field to contain only the Chinese characters.
   - Set the "back" field to contain the Pinyin followed by the English meaning, separated by a dash (-).
2. Ensure each flashcard represents a single, clear idea or concept.
3. Format your output as a JSON array of objects. Each object should have two fields:
   - "front": The Chinese characters
   - "back": The Pinyin and English meaning

Your entire output must be valid JSON. Do not include any additional text, explanations, or commentary outside of the JSON structure.'''

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

@app.post("/upload", response_model=FlashcardResponse)
async def upload_images(files: List[UploadFile] = File(...)):
    try:
        # Read all uploaded images
        images = []
        for file in files:
            content = await file.read()
            images.append(content)
        
        # Get transcription from OpenAI
        transcript_prompt = make_transcript_prompt(TRANSCRIPT_PROMPT, images)
        transcription = client.chat.completions.create(
            messages=transcript_prompt,
            model="gpt-4o",
            max_tokens=1024
        )
        
        # Extract transcription content
        content = transcription.choices[0].message.content
        
        # Generate flashcards
        flashcard_prompt = make_flashcard_prompt(content)
        flashcards = client.chat.completions.create(
            model="gpt-4o",
            messages=[flashcard_prompt],
            temperature=0.3,
        )
        
        # Parse flashcards JSON
        flashcards_json = flashcards.choices[0].message.content
        if flashcards_json.startswith('```json'):
            flashcards_json = flashcards_json[7:-3]  # Remove ```json and ```
        
        # Parse JSON and validate with Pydantic
        flashcards_data = json.loads(flashcards_json)
        flashcards_list = [Flashcard(**card) for card in flashcards_data]
        
        return FlashcardResponse(
            transcription=content,
            flashcards=flashcards_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Flashcard Maker API is running"} 