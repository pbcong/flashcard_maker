# 🔧 Tesseract OCR Installation Guide for Windows

## Quick Installation Steps

### 1. Download Tesseract
- Visit: https://github.com/UB-Mannheim/tesseract/wiki
- Download the latest Windows installer: `tesseract-ocr-w64-setup-v5.x.x.exe`

### 2. Install with Chinese Language Support
1. **Run the installer as Administrator**
2. **During installation, make sure to:**
   - ✅ Check "Add Tesseract to PATH"
   - ✅ Expand "Additional language data (download)" 
   - ✅ Select "Chinese - Simplified" (chi_sim)
   - ✅ Select "Chinese - Traditional" (chi_tra) if needed

### 3. Verify Installation
Open a **new** Command Prompt or PowerShell and run:
```bash
tesseract --version
```

You should see output like:
```
tesseract 5.3.0
 leptonica-1.82.0
  libgif 5.2.1 : libjpeg 8d (libjpeg-turbo 2.1.3) : libpng 1.6.37 : libtiff 4.4.0 : zlib 1.2.11 : libwebp 1.2.4 : libopenjp2 2.4.0
```

### 4. Test Chinese Language Support
```bash
tesseract --list-langs
```

You should see `chi_sim` in the list.

## Manual PATH Configuration (if needed)

If Tesseract wasn't automatically added to PATH:

### Method 1: Using System Properties
1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path" → Click "Edit"
5. Click "New" → Add: `C:\Program Files\Tesseract-OCR`
6. Click "OK" on all dialogs
7. **Restart your terminal/IDE**

### Method 2: Using Command Line
Open Command Prompt as Administrator:
```cmd
setx /M PATH "%PATH%;C:\Program Files\Tesseract-OCR"
```

## Alternative: Portable Installation

If you prefer not to modify system PATH:

1. Download and extract Tesseract to a folder (e.g., `C:\tesseract`)
2. In your Python code, specify the path:

```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\tesseract\tesseract.exe'
```

## Testing Your Installation

After installation, test with our backend:

```bash
cd backend
python -c "import pytesseract; print(pytesseract.get_tesseract_version())"
```

## Common Issues & Solutions

### Issue 1: "tesseract is not recognized"
**Solution:** Tesseract is not in PATH
- Verify installation path: `C:\Program Files\Tesseract-OCR`
- Add to PATH using steps above
- Restart terminal/IDE

### Issue 2: "Failed to load language data"
**Solution:** Chinese language pack not installed
- Re-run installer
- Select "Modify" installation
- Add Chinese language data

### Issue 3: "TesseractNotFoundError"
**Solution:** Python can't find Tesseract
- Verify PATH is set correctly
- Or set explicit path in code:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Troubleshooting Commands

Check if Tesseract is in PATH:
```bash
where tesseract
```

List available languages:
```bash
tesseract --list-langs
```

Test OCR on a simple image:
```bash
tesseract image.png output.txt -l chi_sim
```

## Next Steps

Once Tesseract is installed:
1. Restart your terminal/IDE
2. Test with: `tesseract --version`
3. Run the backend server to test the Pinyin Reader feature

## Alternative: Using Conda

If you prefer using Conda:
```bash
conda install -c conda-forge tesseract
```

This automatically handles PATH configuration. 