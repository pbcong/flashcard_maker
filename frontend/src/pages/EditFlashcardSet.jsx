import { useState, useEffect, useCallback } from 'react';
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchSet = useCallback(async () => {
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
  }, [setId, token]);

  useEffect(() => {
    fetchSet();
  }, [fetchSet]);

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Please enter a title');
    if (cards.some(c => !c.front.trim() || !c.back.trim())) {
      return setError('Please fill in both sides of all cards');
    }

    setSaving(true);
    setError('');

    try {
      await api.updateFlashcardSet(setId, { title, description, cards }, token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="btn-ghost mb-6 inline-flex">← Back</Link>

      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Edit Set</h1>

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
              placeholder="Set title"
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
              placeholder="Description..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Cards ({cards.length})</span>
              <button
                type="button"
                onClick={() => setCards([...cards, { front: '', back: '' }])}
                className="btn-secondary text-sm"
              >
                + Add Card
              </button>
            </div>

            {cards.map((card, index) => (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <textarea
                    value={card.front}
                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                    className="input resize-none"
                    rows={2}
                    placeholder="Front"
                  />
                  <textarea
                    value={card.back}
                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                    className="input resize-none"
                    rows={2}
                    placeholder="Back"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCards(cards.filter((_, i) => i !== index))}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditFlashcardSet;