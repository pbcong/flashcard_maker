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

FLASHCARD_PROMPT = """You are an expert in creating Chinese language learning flashcards. Your task is to generate flashcards from the given Chinese content and output them in JSON format. Here's the content you'll be working with:

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

Your entire output must be valid JSON. Do not include any additional text, explanations, or commentary outside of the JSON structure."""