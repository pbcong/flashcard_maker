import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

function EditFlashcardSet() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchSet();
  }, [setId, token]);

  const fetchSet = async () => {
    try {
      const data = await api.getFlashcardSet(setId, token);
      setTitle(data.title);
      setDescription(data.description || '');
      setCards(data.flashcards || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (cards.some(card => !card.front.trim() || !card.back.trim())) {
      setError('Please fill in both sides of all cards');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.updateFlashcardSet(setId, { title, description, cards }, token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Set</h1>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                rows="3"
                placeholder="Enter set description"
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
                <button
                  type="button"
                  onClick={handleAddCard}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Card
                </button>
              </div>

              {cards.map((card, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Front
                      </label>
                      <textarea
                        value={card.front}
                        onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        rows="3"
                        placeholder="Front side text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Back
                      </label>
                      <textarea
                        value={card.back}
                        onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        rows="3"
                        placeholder="Back side text"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditFlashcardSet; 