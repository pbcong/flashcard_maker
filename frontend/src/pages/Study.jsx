import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Study = () => {
  const { setId } = useParams();
  const { token } = useAuth();
  const [queue, setQueue] = useState([]);
  const [initialCount, setInitialCount] = useState(0);
  const [struggleScores, setStruggleScores] = useState({});
  const [reviewCounts, setReviewCounts] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  const fetchDueCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getDueCards(setId, token);
      const shuffled = response.sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setInitialCount(shuffled.length);
      setStruggleScores(shuffled.reduce((acc, card) => ({ ...acc, [card.id]: 0 }), {}));
      setReviewCounts(shuffled.reduce((acc, card) => ({ ...acc, [card.id]: 0 }), {}));
      if (shuffled.length > 0) {
        setCurrentCard(shuffled[0]);
      } else {
        setSessionComplete(true);
      }
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch cards');
      setIsLoading(false);
    }
  }, [setId, token]);

  useEffect(() => {
    if (token) fetchDueCards();
  }, [fetchDueCards, token]);

  const handleFlip = () => setIsFlipped(true);

  const handleReview = async (quality) => {
    if (!currentCard) return;

    try {
      await api.submitReview({ flashcard_id: currentCard.id, response_quality: quality }, token);
    } catch (err) {
      console.error('Review failed:', err);
    }

    const newReviewCounts = { ...reviewCounts, [currentCard.id]: (reviewCounts[currentCard.id] || 0) + 1 };
    setReviewCounts(newReviewCounts);

    const scoreDelta = { Again: 3, Hard: 2, Good: -1, Easy: -2 }[quality] || 0;
    const newStruggleScores = { ...struggleScores, [currentCard.id]: (struggleScores[currentCard.id] || 0) + scoreDelta };
    setStruggleScores(newStruggleScores);

    let newQueue = queue.filter(c => c.id !== currentCard.id);
    
    if (newReviewCounts[currentCard.id] < 5) {
      if (quality === 'Again' || quality === 'Hard') {
        newQueue.push(currentCard);
      } else if (quality === 'Good' && Math.random() < 0.2) {
        newQueue.push(currentCard);
      }
      newQueue.sort((a, b) => (newStruggleScores[b.id] || 0) - (newStruggleScores[a.id] || 0));
    }

    setQueue(newQueue);
    setIsFlipped(false);
    
    if (newQueue.length > 0) {
      setCurrentCard(newQueue[0]);
    } else {
      setSessionComplete(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Session complete!</h2>
        <p className="text-neutral-500 mb-6">You&apos;ve reviewed all due cards.</p>
        <Link to={`/sets/${setId}`} className="btn-primary">
          Back to Set
        </Link>
      </div>
    );
  }

  if (!currentCard) return null;

  const progress = initialCount > 0 ? ((initialCount - queue.length) / initialCount) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/sets/${setId}`} className="btn-ghost">
          ← Exit
        </Link>
        <span className="text-sm text-neutral-500">{queue.length} cards left</span>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-8">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div
        onClick={!isFlipped ? handleFlip : undefined}
        className="card p-8 min-h-[280px] flex items-center justify-center cursor-pointer mb-8"
      >
        <p className="text-xl text-center text-neutral-800">
          {isFlipped ? (currentCard.back || 'No answer') : (currentCard.front || 'No question')}
        </p>
      </div>

      {/* Actions */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => handleReview('Again')} className="btn bg-red-500 text-white hover:bg-red-600">
            Again
          </button>
          <button onClick={() => handleReview('Hard')} className="btn bg-amber-500 text-white hover:bg-amber-600">
            Hard
          </button>
          <button onClick={() => handleReview('Good')} className="btn bg-blue-500 text-white hover:bg-blue-600">
            Good
          </button>
          <button onClick={() => handleReview('Easy')} className="btn bg-green-500 text-white hover:bg-green-600">
            Easy
          </button>
        </div>
      ) : (
        <button onClick={handleFlip} className="btn-primary w-full">
          Flip Card
        </button>
      )}
    </div>
  );
};

export default Study;
