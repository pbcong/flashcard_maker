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

  // Check if we have prefilled cards from PinyinReader
  useEffect(() => {
    if (location.state?.prefilledCards) {
      setManualCards(location.state.prefilledCards);
      setIsManualMode(true);
      if (location.state.fromPinyinReader) {
        setTitle('Chinese Vocabulary');
        setDescription('Flashcards generated from Pinyin Reader');
      }
    }
  }, [location.state]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newFilePreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return { url: URL.createObjectURL(file), type: 'image' };
      } else {
        return { name: file.name, type: 'file' };
      }
    });
    setFilePreviews(prev => [...prev, ...newFilePreviews]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index].type === 'image') {
        URL.revokeObjectURL(newPreviews[index].url);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!isManualMode && selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (isManualMode && manualCards.length === 0) {
      setError('Please add at least one flashcard');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let cards = [];
      
      if (isManualMode) {
        // Use manual cards directly
        cards = manualCards;
      } else {
        // Process uploaded files
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        const response = await api.uploadFiles(formData, token);
        cards = response.flashcards;
      }
      
      await api.createFlashcardSet({
        title,
        description,
        cards
      }, token);

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create flashcard set');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Sets
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Set</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter set title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                placeholder="Add a description..."
              />
            </div>

            {/* Mode Toggle */}
            {!location.state?.fromPinyinReader && (
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className={`px-4 py-2 rounded-md ${!isManualMode ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualMode(true)}
                  className={`px-4 py-2 rounded-md ${isManualMode ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Manual Entry
                </button>
              </div>
            )}

            {/* Manual Cards Section */}
            {isManualMode ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
                  <button
                    type="button"
                    onClick={() => setManualCards([...manualCards, { front: '', back: '' }])}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-900"
                  >
                    Add Card
                  </button>
                </div>

                <div className="space-y-4">
                  {manualCards.map((card, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Front
                          </label>
                          <input
                            type="text"
                            value={card.front}
                            onChange={(e) => {
                              const newCards = [...manualCards];
                              newCards[index] = { ...newCards[index], front: e.target.value };
                              setManualCards(newCards);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                            placeholder="Question or term"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Back
                          </label>
                          <input
                            type="text"
                            value={card.back}
                            onChange={(e) => {
                              const newCards = [...manualCards];
                              newCards[index] = { ...newCards[index], back: e.target.value };
                              setManualCards(newCards);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                            placeholder="Answer or definition"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManualCards(manualCards.filter((_, i) => i !== index))}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Files</h2>
                  <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {preview.type === 'image' ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                          <span className="text-gray-500">{preview.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Set'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateFlashcardSet; 