import io
import re
from typing import List, Dict
from PIL import Image
import pytesseract
from pypinyin import pinyin, Style
import jieba
import os

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    # Try common Tesseract paths
    possible_paths = [
        r'D:\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break


def is_chinese_char(char):
    """Check if a character is Chinese."""
    return '\u4e00' <= char <= '\u9fff'


def check_tesseract_installation():
    """Check if Tesseract is properly installed and accessible."""
    try:
        version = pytesseract.get_tesseract_version()
        
        # Check for Chinese language support
        try:
            languages = pytesseract.get_languages()
            has_chinese = 'chi_sim' in languages
            
            if has_chinese:
                return True, f"Tesseract {version} with Chinese support is available"
            else:
                return False, f"Tesseract {version} is installed but Chinese language data (chi_sim) is missing. Available languages: {', '.join(languages)}"
        except:
            return True, f"Tesseract {version} is installed (language check failed)"
            
    except Exception as e:
        return False, str(e)


async def process_image_for_pinyin(image_bytes: bytes) -> Dict:
    """
    Process an image to extract Chinese text and generate pinyin annotations.
    
    Args:
        image_bytes: The image content as bytes
        
    Returns:
        Dictionary containing the extracted text and pinyin annotations
    """
    try:
        # Check if Tesseract is installed
        tesseract_available, tesseract_status = check_tesseract_installation()
        if not tesseract_available:
            raise ValueError(
                "Tesseract OCR is not installed or not accessible. "
                "Please install Tesseract OCR with Chinese language support. "
                "See TESSERACT_INSTALLATION_GUIDE.md for detailed instructions. "
                f"Error: {tesseract_status}"
            )
        
        # Convert bytes to PIL Image
        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception as e:
            raise ValueError(f"Invalid image format: {str(e)}")
        
        # Perform OCR to extract text
        try:
            # Try Chinese first, fall back to English if Chinese is not available
            try:
                extracted_text = pytesseract.image_to_string(image, lang='chi_sim')
            except pytesseract.TesseractError:
                # Fallback to English if Chinese is not available
                extracted_text = pytesseract.image_to_string(image, lang='eng')
                
        except pytesseract.TesseractError as e:
            if "chi_sim" in str(e):
                raise ValueError(
                    "Chinese language data not found. Please install Tesseract with Chinese (Simplified) language support. "
                    "Download chi_sim.traineddata from https://github.com/tesseract-ocr/tessdata/raw/main/chi_sim.traineddata "
                    "and place it in D:\Tesseract-OCR\tessdata\ directory."
                )
            else:
                raise ValueError(f"OCR failed: {str(e)}")
        except Exception as e:
            raise ValueError(f"OCR processing error: {str(e)}")
        
        # Clean up the extracted text
        extracted_text = extracted_text.strip()
        
        if not extracted_text:
            raise ValueError("No text detected in the image")
        
        # Check if the text contains Chinese characters
        has_chinese = any(is_chinese_char(char) for char in extracted_text)
        if not has_chinese:
            raise ValueError("No Chinese text detected in the image")
        
        # Generate character-level annotations
        annotations = []
        char_index = 0
        
        for char in extracted_text:
            if is_chinese_char(char):
                # Get pinyin for the character
                char_pinyin = pinyin(char, style=Style.TONE, errors='default')
                pinyin_str = char_pinyin[0][0] if char_pinyin else char
                
                annotations.append({
                    "char": char,
                    "pinyin": pinyin_str,
                    "index": char_index
                })
            char_index += 1
        
        # Generate word-level annotations using jieba for better word segmentation
        words = []
        # Segment the text into words
        word_list = list(jieba.cut(extracted_text))
        
        pos = 0
        for word in word_list:
            word_len = len(word)
            if any(is_chinese_char(char) for char in word):
                # Get pinyin for the word
                word_pinyin = pinyin(word, style=Style.TONE, errors='default')
                pinyin_str = ' '.join([p[0] for p in word_pinyin])
                
                words.append({
                    "word": word,
                    "pinyin": pinyin_str,
                    "start": pos,
                    "end": pos + word_len - 1
                })
            pos += word_len
        
        return {
            "text": extracted_text,
            "annotations": annotations,
            "words": words
        }
    except Exception as e:
        # Catch any unexpected errors and re-raise as ValueError for consistent handling
        raise ValueError(f"An unexpected error occurred during image processing: {str(e)}")


def process_text_for_pinyin(text: str) -> Dict:
    """
    Process a string of text to generate pinyin annotations.
    
    Args:
        text: The input text string.
        
    Returns:
        Dictionary containing the original text and pinyin annotations.
    """
    # Clean up the extracted text
    cleaned_text = text.strip()
    
    if not cleaned_text:
        raise ValueError("Input text is empty")
    
    # Check if the text contains Chinese characters
    has_chinese = any(is_chinese_char(char) for char in cleaned_text)
    if not has_chinese:
        raise ValueError("No Chinese text detected in the input")
    
    # Generate character-level annotations
    annotations = []
    char_index = 0
    
    for char in cleaned_text:
        if is_chinese_char(char):
            # Get pinyin for the character
            char_pinyin = pinyin(char, style=Style.TONE, errors='default')
            pinyin_str = char_pinyin[0][0] if char_pinyin else char
            
            annotations.append({
                "char": char,
                "pinyin": pinyin_str,
                "index": char_index
            })
        char_index += 1
    
    # Generate word-level annotations using jieba for better word segmentation
    words = []
    # Segment the text into words
    word_list = list(jieba.cut(cleaned_text))
    
    pos = 0
    for word in word_list:
        word_len = len(word)
        # Only include words that contain at least one Chinese character
        if any(is_chinese_char(char) for char in word):
            # Get pinyin for the word
            word_pinyin = pinyin(word, style=Style.TONE, errors='default')
            pinyin_str = ' '.join([p[0] for p in word_pinyin])
            
            words.append({
                "word": word,
                "pinyin": pinyin_str,
                "start": pos,
                "end": pos + word_len - 1
            })
        pos += word_len
        
    return {
        "text": cleaned_text,
        "annotations": annotations,
        "words": words
    }