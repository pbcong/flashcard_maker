import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFlashcardSet, updateFlashcardSet } from '../services/api';

const FlashcardSetView = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchSet();
  }, [setId]);

  const fetchSet = async () => {
    try {
      setLoading(true);
      const data = await getFlashcardSet(setId);
      setSet(data);
      setError(null);
    } catch (err) {
      setError('Failed to load flashcard set');
      console.error('Error fetching set:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShuffleToggle = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled) {
      // Shuffle the cards
      const shuffledCards = [...set.cards].sort(() => Math.random() - 0.5);
      setSet({ ...set, cards: shuffledCards });
    } else {
      // Reset to original order
      fetchSet();
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    if (currentCardIndex < set.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading flashcard set...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!set) return <div className="text-center py-8">No flashcard set found</div>;

  const currentCard = set.cards[currentCardIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{set.title}</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleShuffleToggle}
            className={`${
              isShuffled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white font-medium py-2 px-4 rounded-md transition-colors duration-200`}
          >
            {isShuffled ? 'Unshuffle' : 'Shuffle'}
          </button>
          <button
            onClick={() => navigate(`/sets/${setId}/edit`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Edit Set
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div
          className={`relative h-64 bg-white rounded-lg shadow-lg cursor-pointer transform transition-transform duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-xl text-gray-800 text-center">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Card {currentCardIndex + 1} of {set.cards.length}
          </span>
          <button
            onClick={handleNextCard}
            disabled={currentCardIndex === set.cards.length - 1}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardSetView; 