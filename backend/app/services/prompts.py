"""Prompt templates for flashcard generation."""


def get_flashcard_prompt(back_language: str = "english") -> str:
    """Generate the prompt for flashcard creation based on user preferences."""
    
    language_instruction = {
        "english": "English translation/definition",
        "vietnamese": "Vietnamese translation/definition (bản dịch tiếng Việt)"
    }.get(back_language, "English translation/definition")
    
    return f"""You are an expert flashcard creator. Analyze the provided content (text or images) and create effective flashcards for learning.

## Instructions

1. **Identify key concepts**: Extract vocabulary, terms, concepts, or facts worth learning
2. **Create flashcards**: For each item, create a card with:
   - **front**: The term, word, or concept (in the original language from the content)
   - **back**: The {language_instruction}

3. **Quality guidelines**:
   - Keep cards atomic (one concept per card)
   - Front should be concise (1-5 words typically)
   - Back should include meaning and pronunciation guide if applicable (e.g., pinyin for Chinese)
   - For vocabulary: include part of speech if relevant
   - For concepts: provide clear, memorable definitions

4. **Examples**:
   - For Chinese text: front="你好", back="nǐ hǎo - Hello"
   - For technical terms: front="API", back="Application Programming Interface - a way for programs to communicate"

## Output Format

Return a JSON object with a "flashcards" array. Each flashcard has "front" and "back" fields.

Example:
{{"flashcards": [{{"front": "学习", "back": "xué xí - to study, to learn"}}]}}

Now analyze the content and create flashcards:"""