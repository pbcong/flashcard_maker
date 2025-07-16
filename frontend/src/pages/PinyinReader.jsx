import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Tooltip } from 'react-tooltip';

function PinyinReader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [annotationResult, setAnnotationResult] = useState(null);
  const [showAllPinyin, setShowAllPinyin] = useState(false);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const fileInputRef = useRef(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setAnnotationResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.annotatePinyin(selectedFile, token);
      setAnnotationResult(result);
    } catch (err) {
      setError(err.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAnnotationResult(null);
    setSelectedWords(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleWordSelection = (word) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const handleGenerateFlashcards = () => {
    // Convert selected words to flashcards format
    const flashcards = Array.from(selectedWords).map(wordData => {
      const [word, pinyin] = wordData.split('|');
      return {
        front: word,
        back: pinyin
      };
    });

    // Navigate to create flashcard set page with pre-filled cards
    navigate('/create', { 
      state: { 
        prefilledCards: flashcards,
        fromPinyinReader: true 
      } 
    });
  };

  const renderAnnotatedText = () => {
    if (!annotationResult) return null;

    const { text, annotations } = annotationResult;
    const elements = [];
    let lastIndex = 0;

    // Sort annotations by index
    const sortedAnnotations = [...annotations].sort((a, b) => a.index - b.index);

    sortedAnnotations.forEach((annotation, i) => {
      // Add any text before this annotation
      if (annotation.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, annotation.index)}
          </span>
        );
      }

      // Add the annotated character
      const tooltipId = `pinyin-${i}`;
      elements.push(
        <span key={`char-${i}`} className="relative inline-block">
          <span
            data-tooltip-id={tooltipId}
            data-tooltip-content={annotation.pinyin}
            className="cursor-pointer hover:bg-yellow-200 transition-colors duration-200 border-b-2 border-transparent hover:border-gray-400"
          >
            {annotation.char}
          </span>
          {showAllPinyin && (
            <span className="absolute -top-6 left-0 text-xs text-gray-600 whitespace-nowrap">
              {annotation.pinyin}
            </span>
          )}
          <Tooltip id={tooltipId} />
        </span>
      );

      lastIndex = annotation.index + 1;
    });

    // Add any remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Pinyin Reader</h1>
        <p className="text-gray-600">
          Upload an image containing Chinese text to get interactive pinyin annotations
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Upload Section */}
      {!annotationResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          
          <div className="space-y-4">
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600 mb-2">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Select Image
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg max-h-96 mx-auto"
                  />
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Analyze Image'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {annotationResult && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllPinyin}
                    onChange={(e) => setShowAllPinyin(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Show All Pinyin</span>
                </label>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-600 hover:text-gray-800"
              >
                Upload New Image
              </button>
            </div>
          </div>

          {/* Annotated Text */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
            <div 
              className={`text-lg leading-relaxed ${showAllPinyin ? 'pt-8' : ''}`}
              style={{ lineHeight: showAllPinyin ? '3rem' : '2rem' }}
            >
              {renderAnnotatedText()}
            </div>
          </div>

          {/* Word Selection */}
          {annotationResult.words && annotationResult.words.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Select Words for Flashcards</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {annotationResult.words.map((wordData, index) => {
                  const wordKey = `${wordData.word}|${wordData.pinyin}`;
                  return (
                    <button
                      key={index}
                      onClick={() => toggleWordSelection(wordKey)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedWords.has(wordKey)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg font-medium">{wordData.word}</div>
                      <div className="text-sm text-gray-600">{wordData.pinyin}</div>
                    </button>
                  );
                })}
              </div>
              {selectedWords.size > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateFlashcards}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Generate Flashcards ({selectedWords.size} words)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-center text-gray-700">
              Analyzing image and generating pinyin...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PinyinReader; 