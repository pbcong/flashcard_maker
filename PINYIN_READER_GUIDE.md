# 📖 Pinyin Reader Feature Guide

## Overview

The Pinyin Reader is an interactive feature that allows users to upload images containing Chinese text and get interactive pinyin (Romanized pronunciation) annotations. This feature is perfect for Chinese language learners who want to practice reading without constantly looking up character pronunciations.

## Features

### 🖼️ Image Upload & OCR
- Upload images containing Chinese text (JPEG, PNG, up to 10MB)
- Automatic text extraction using OCR (Optical Character Recognition)
- Support for printed Chinese text (simplified Chinese)

### 🔤 Interactive Pinyin Display
- **Hover Mode**: Hover over any Chinese character to see its pinyin in a tooltip
- **Full Display Mode**: Toggle to show all pinyin annotations at once
- Character-level and word-level pinyin generation

### 🃏 Flashcard Integration
- Select words/characters from the annotated text
- Generate flashcards with Chinese characters on the front and pinyin on the back
- Seamlessly integrate with existing flashcard creation workflow

## Setup Requirements

### Backend Dependencies

The following packages need to be installed:

```bash
pip install pytesseract Pillow pypinyin jieba
```

### Tesseract OCR Installation

Tesseract OCR must be installed separately on your system:

#### Windows
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. During installation, make sure to:
   - Add Tesseract to PATH
   - Install Chinese (Simplified) language data

#### macOS
```bash
brew install tesseract
brew install tesseract-lang  # For Chinese language support
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-chi-sim  # Chinese simplified
```

### Verify Installation

Run the test script to verify everything is set up correctly:

```bash
cd backend
python test_ocr_setup.py
```

## Usage Guide

### 1. Access Pinyin Reader

Click the "Pinyin Reader" button in the navigation bar.

### 2. Upload an Image

- Click "Select Image" or drag and drop an image
- Supported formats: JPEG, PNG
- Maximum size: 10MB
- Best results with clear, printed Chinese text

### 3. View Annotated Text

After processing:
- **Interactive Mode (Default)**:
  - Hover over Chinese characters to see pinyin tooltips
  - Characters are highlighted on hover
  
- **Full Display Mode**:
  - Toggle "Show All Pinyin" to display all annotations
  - Pinyin appears above each character

### 4. Generate Flashcards (Optional)

1. Click on words in the "Select Words for Flashcards" section
2. Selected words are highlighted in blue
3. Click "Generate Flashcards (X words)" 
4. You'll be redirected to create a new flashcard set with pre-filled cards

## API Endpoints

### POST /v1/pinyin/annotate

Upload an image for pinyin annotation.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file)
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "text": "你好世界",
  "annotations": [
    {"char": "你", "pinyin": "nǐ", "index": 0},
    {"char": "好", "pinyin": "hǎo", "index": 1},
    {"char": "世", "pinyin": "shì", "index": 2},
    {"char": "界", "pinyin": "jiè", "index": 3}
  ],
  "words": [
    {"word": "你好", "pinyin": "nǐ hǎo"},
    {"word": "世界", "pinyin": "shì jiè"}
  ]
}
```

## Technical Implementation

### Backend Architecture

1. **Image Processing Pipeline**:
   ```
   Image Upload → Validation → OCR (Tesseract) → Chinese Text Detection → 
   Pinyin Generation → Word Segmentation (Jieba) → Response
   ```

2. **Key Components**:
   - `pinyin.py`: FastAPI router handling the endpoint
   - `pinyin_service.py`: Core OCR and pinyin generation logic
   - Uses `pytesseract` for OCR with Chinese language model
   - Uses `pypinyin` for accurate pinyin with tones
   - Uses `jieba` for intelligent word segmentation

### Frontend Implementation

1. **React Components**:
   - `PinyinReader.jsx`: Main component with upload and display logic
   - Uses `react-tooltip` for interactive pinyin tooltips
   - Responsive design with Tailwind CSS

2. **State Management**:
   - File upload state with preview
   - Annotation results storage
   - Toggle state for display modes
   - Selected words tracking for flashcard generation

## Troubleshooting

### Common Issues

1. **"Tesseract not found" Error**
   - Ensure Tesseract is installed and in PATH
   - On Windows, you may need to restart your terminal/IDE

2. **"No Chinese text detected"**
   - Ensure image has clear, printed Chinese text
   - Try a higher resolution image
   - Avoid handwritten text (not supported)

3. **Incorrect Character Recognition**
   - Use clearer images with good contrast
   - Avoid stylized or decorative fonts
   - Ensure Chinese language data is installed for Tesseract

4. **Pinyin Tone Marks Not Showing**
   - The system uses tone numbers (e.g., ni3 hao3)
   - This is intentional for better compatibility

## Future Enhancements

- [ ] Support for traditional Chinese characters
- [ ] Handwriting recognition
- [ ] Audio pronunciation playback
- [ ] English translation alongside pinyin
- [ ] Batch processing for multiple images
- [ ] Export annotated text as PDF
- [ ] Integration with spaced repetition system

## Development Notes

- The feature uses lazy loading for better performance
- Images are processed server-side to avoid client-side computational load
- Temporary image storage is not implemented (processed in memory)
- Character-level and word-level annotations provide flexibility 