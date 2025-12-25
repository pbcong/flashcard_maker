import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import FlashcardSetCard from '../components/FlashcardSetCard';

function FlashcardSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  const fetchSets = useCallback(async () => {
    try {
      const data = await api.getFlashcardSets(token);
      setSets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleDelete = async (setId) => {
    if (!window.confirm('Are you sure you want to delete this set?')) return;

    try {
      await api.deleteFlashcardSet(setId, token);
      setSets(sets.filter(set => set.id !== setId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredSets = sets.filter(set => 
    set.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search */}
      <div className="relative mb-8">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search sets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {error && (
        <div className="alert-error mb-6">
          {error}
        </div>
      )}

      {filteredSets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500">No flashcard sets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map((set) => (
            <FlashcardSetCard
              key={set.id}
              set={set}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FlashcardSets;