from typing import List, Optional

from supabase import Client, create_client

from ..core.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)


def get_flashcard_sets(user_id: str) -> List[dict]:
    result = supabase.table("flashcard_sets").select(
        "id, title, description, owner_id, flashcards(id, front, back)"
    ).eq("owner_id", user_id).execute()
    return result.data if result.data else []


def get_flashcard_set(set_id: int, user_id: str) -> Optional[dict]:
    result = supabase.table("flashcard_sets").select(
        "id, title, description, owner_id, flashcards(id, front, back)"
    ).eq("id", set_id).eq("owner_id", user_id).execute()
    return result.data[0] if result.data else None


def delete_flashcard_set(set_id: int, user_id: str) -> bool:
    result = supabase.table("flashcard_sets").delete().eq(
        "id", set_id
    ).eq("owner_id", user_id).execute()
    return bool(result.data)


def create_flashcard_set(data: dict, user_id: str) -> dict:
    set_data = {
        "title": data.get("title"),
        "description": data.get("description"),
        "owner_id": user_id
    }
    
    set_result = supabase.table("flashcard_sets").insert(set_data).execute()
    if not set_result.data:
        raise Exception("Failed to create flashcard set")
    
    new_set_id = set_result.data[0]["id"]
    
    cards_to_insert = [
        {
            "front": card["front"],
            "back": card["back"],
            "set_id": new_set_id
        } for card in data.get("cards", [])
    ]
    
    if cards_to_insert:
        cards_result = supabase.table("flashcards").insert(cards_to_insert).execute()
        if not cards_result.data:
            supabase.table("flashcard_sets").delete().eq("id", new_set_id).execute()
            raise Exception("Failed to create flashcards")
    
    result = supabase.table("flashcard_sets").select(
        "id, title, description, owner_id, flashcards(id, front, back)"
    ).eq("id", new_set_id).execute()
    
    if not result.data:
        raise Exception("Failed to fetch created flashcard set")
    
    return result.data[0]


def update_flashcard_set(set_id: int, data: dict, user_id: str) -> dict:
    set_check = supabase.table("flashcard_sets").select("id").eq(
        "id", set_id
    ).eq("owner_id", user_id).execute()
    if not set_check.data:
        raise Exception("Flashcard set not found")

    set_data = {
        "title": data.get("title"),
        "description": data.get("description")
    }
    set_data = {k: v for k, v in set_data.items() if v is not None}
    
    if set_data:
        set_result = supabase.table("flashcard_sets").update(set_data).eq(
            "id", set_id
        ).execute()
        if not set_result.data:
            raise Exception("Failed to update flashcard set")

    if "cards" in data:
        supabase.table("flashcards").delete().eq("set_id", set_id).execute()
        
        cards_to_insert = [
            {
                "front": card["front"],
                "back": card["back"],
                "set_id": set_id
            } for card in data["cards"]
        ]
        
        if cards_to_insert:
            cards_result = supabase.table("flashcards").insert(
                cards_to_insert
            ).execute()
            if not cards_result.data:
                raise Exception("Failed to update flashcards")

    result = supabase.table("flashcard_sets").select(
        "id, title, description, owner_id, flashcards(id, front, back)"
    ).eq("id", set_id).execute()
    
    if not result.data:
        raise Exception("Failed to fetch updated flashcard set")
    
    return result.data[0]
