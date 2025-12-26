import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

function CreateFlashcardSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filePreviews, setFilePreviews] = useState([]);
  const [manualCards, setManualCards] = useState([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefilledCards) {
      setManualCards(location.state.prefilledCards);
      setIsManualMode(true);
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
    if (!isManualMode && selectedFiles.length === 0) return setError('Please select at least one file');
    if (isManualMode && manualCards.length === 0) return setError('Please add at least one flashcard');

    setLoading(true);
    setError('');

    try {
      let cards = [];
      
      if (isManualMode) {
        cards = manualCards;
      } else {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        const response = await api.uploadFiles(formData, token);
        cards = response.flashcards;
      }
      
      await api.createFlashcardSet({ title, description, cards }, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create flashcard set');
    } finally {
      setLoading(false);
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

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsManualMode(false)}
              className={!isManualMode ? 'btn-primary' : 'btn-secondary'}
            >
              Upload Files
            </button>
            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className={isManualMode ? 'btn-primary' : 'btn-secondary'}
            >
              Manual Entry
            </button>
          </div>

          {/* Manual Cards */}
          {isManualMode ? (
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
          ) : (
            /* File Upload */
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
            className="btn-primary w-full"
          >
            {loading ? <span className="spinner" /> : 'Create Set'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateFlashcardSet;