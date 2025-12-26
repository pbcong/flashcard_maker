import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

function CreateFlashcardSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [filePreviews, setFilePreviews] = useState([]);
  const [manualCards, setManualCards] = useState([]);
  const [pasteText, setPasteText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload', 'paste', 'manual'
  const [backLanguage, setBackLanguage] = useState('english');
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefilledCards) {
      setManualCards(location.state.prefilledCards);
      setInputMode('manual');
    }
  }, [location.state]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return { url: URL.createObjectURL(file), type: 'image' };
      }
      return { name: file.name, type: 'file' };
    });
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      if (prev[index].type === 'image') URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Please enter a title');
    
    // Validate based on mode
    if (inputMode === 'upload' && selectedFiles.length === 0) {
      return setError('Please select at least one file');
    }
    if (inputMode === 'paste' && !pasteText.trim()) {
      return setError('Please enter some text');
    }
    if (inputMode === 'manual' && manualCards.length === 0) {
      return setError('Please add at least one flashcard');
    }

    setLoading(true);
    setLoadingMessage('Preparing...');
    setError('');

    try {
      let cards = [];
      
      if (inputMode === 'manual') {
        cards = manualCards;
      } else if (inputMode === 'paste') {
        setLoadingMessage('Analyzing text with AI...');
        const response = await api.generateFromText(pasteText, backLanguage, token);
        cards = response.flashcards;
      } else {
        setLoadingMessage('Analyzing content with AI...');
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        const response = await api.uploadFiles(formData, token, { backLanguage });
        cards = response.flashcards;
      }
      
      setLoadingMessage('Creating flashcard set...');
      await api.createFlashcardSet({ title, description, cards }, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create flashcard set');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="btn-ghost mb-6 inline-flex">
        ← Back
      </Link>

      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Create New Set</h1>

        {error && <div className="alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="input-label">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter set title"
            />
          </div>

          <div>
            <label htmlFor="description" className="input-label">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Add a description..."
            />
          </div>

          {/* Language Selector */}
          <div>
            <label htmlFor="backLanguage" className="input-label">Translation Language</label>
            <select
              id="backLanguage"
              value={backLanguage}
              onChange={(e) => setBackLanguage(e.target.value)}
              className="input"
            >
              <option value="english">English</option>
              <option value="vietnamese">Tiếng Việt</option>
            </select>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={inputMode === 'upload' ? 'btn-primary' : 'btn-secondary'}
            >
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={inputMode === 'paste' ? 'btn-primary' : 'btn-secondary'}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={inputMode === 'manual' ? 'btn-primary' : 'btn-secondary'}
            >
              Manual Entry
            </button>
          </div>

          {/* Input Area based on mode */}
          {inputMode === 'manual' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Cards ({manualCards.length})</span>
                <button
                  type="button"
                  onClick={() => setManualCards([...manualCards, { front: '', back: '' }])}
                  className="btn-secondary text-sm"
                >
                  + Add Card
                </button>
              </div>

              {manualCards.map((card, index) => (
                <div key={index} className="p-4 border border-neutral-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={card.front}
                      onChange={(e) => {
                        const newCards = [...manualCards];
                        newCards[index] = { ...newCards[index], front: e.target.value };
                        setManualCards(newCards);
                      }}
                      className="input"
                      placeholder="Front"
                    />
                    <input
                      type="text"
                      value={card.back}
                      onChange={(e) => {
                        const newCards = [...manualCards];
                        newCards[index] = { ...newCards[index], back: e.target.value };
                        setManualCards(newCards);
                      }}
                      className="input"
                      placeholder="Back"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualCards(manualCards.filter((_, i) => i !== index))}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : inputMode === 'paste' ? (
            /* Paste Text Mode */
            <div>
              <label htmlFor="pasteText" className="input-label">Paste your text here</label>
              <textarea
                id="pasteText"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={8}
                className="input resize-none font-mono text-sm"
                placeholder="Paste vocabulary, notes, or any text content here. The AI will extract key concepts and create flashcards..."
              />
              <p className="text-xs text-neutral-500 mt-1">
                {pasteText.length} characters
              </p>
            </div>
          ) : (
            /* File Upload Mode */
            <div className="space-y-4">
              <label className="btn-secondary cursor-pointer inline-flex">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Files
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,text/plain"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {filePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {preview.type === 'image' ? (
                        <img src={preview.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-24 bg-neutral-100 rounded-lg flex items-center justify-center text-xs text-neutral-500">
                          {preview.name}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>{loadingMessage || 'Processing...'}</span>
              </>
            ) : (
              'Create Set'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateFlashcardSet;