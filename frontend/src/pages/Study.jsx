import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Study = () => {
    const { setId } = useParams();
    const { token } = useAuth();
    const [queue, setQueue] = useState([]);
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
            setStruggleScores(shuffled.reduce((acc, card) => ({ ...acc, [card.id]: 0 }), {}));
            setReviewCounts(shuffled.reduce((acc, card) => ({ ...acc, [card.id]: 0 }), {}));
            if (shuffled.length > 0) {
                setCurrentCard(shuffled[0]);
            } else {
                setSessionComplete(true);
            }
            setIsLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to fetch cards for review. Please try again later.');
            setIsLoading(false);
        }
    }, [setId, token]);

    useEffect(() => {
        if (token) {
            fetchDueCards();
        }
    }, [fetchDueCards, token]);

    const handleFlip = () => {
        setIsFlipped(true);
    };

    const handleReview = async (responseQuality) => {
        if (!currentCard) return;

        try {
            await api.submitReview({
                flashcard_id: currentCard.id,
                response_quality: responseQuality,
            }, token);
        } catch (err) {
            console.error('Failed to submit review:', err);
        }

        // Update review count
        const newReviewCounts = { ...reviewCounts, [currentCard.id]: (reviewCounts[currentCard.id] || 0) + 1 };
        setReviewCounts(newReviewCounts);

        // Update struggle score
        let scoreDelta;
        switch (responseQuality) {
            case 'Again': scoreDelta = 3; break;
            case 'Hard': scoreDelta = 2; break;
            case 'Good': scoreDelta = -1; break;
            case 'Easy': scoreDelta = -2; break;
            default: scoreDelta = 0;
        }
        const newStruggleScores = { ...struggleScores, [currentCard.id]: (struggleScores[currentCard.id] || 0) + scoreDelta };
        setStruggleScores(newStruggleScores);

        // Update queue: remove current, potentially re-add based on quality and caps
        let newQueue = queue.filter(c => c.id !== currentCard.id);
        const maxReviewsPerCard = 5; // Prevent infinite loops
        if (newReviewCounts[currentCard.id] < maxReviewsPerCard) {
            if (responseQuality === 'Again' || responseQuality === 'Hard') {
                newQueue.push(currentCard);
            } else if (responseQuality === 'Good' && Math.random() < 0.2) { // 20% chance to re-add Good for reinforcement
                newQueue.push(currentCard);
            }
            // Sort by struggle score descending, then shuffle within same scores
            newQueue.sort((a, b) => (newStruggleScores[b.id] || 0) - (newStruggleScores[a.id] || 0));
            // Shuffle within groups (optional for variety)
            const grouped = {};
            newQueue.forEach(card => {
                const score = newStruggleScores[card.id] || 0;
                if (!grouped[score]) grouped[score] = [];
                grouped[score].push(card);
            });
            newQueue = Object.values(grouped).flatMap(group => group.sort(() => Math.random() - 0.5));
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
        return <div className="text-center pt-6">Loading study session...</div>;
    }

    if (error) {
        return <div className="text-center pt-6 text-red-500">{error}</div>;
    }

    if (sessionComplete) {
        return (
            <div className="text-center pt-6">
                <h2 className="text-2xl font-bold mb-4">Study session complete!</h2>
                <p className="mb-6">You've reviewed all due cards for this set.</p>
                <Link to={`/sets/${setId}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back to Set
                </Link>
            </div>
        );
    }

    if (!currentCard) return null;

    const initialQueueLength = queue.length;
    const progress = (initialQueueLength > 0) ? ((initialQueueLength - queue.length) / initialQueueLength) * 100 : 100;

    return (
        <div className="max-w-2xl mx-auto pt-6">
            <div className="mb-4 flex justify-between items-center">
                <Link to={`/sets/${setId}`} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    Exit Study
                </Link>
                <div className="text-lg font-semibold">
                    Cards left: {queue.length}
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-8">
                <div 
                    className="relative w-full h-64 flex items-center justify-center text-2xl font-semibold text-gray-800 text-center cursor-pointer"
                    onClick={!isFlipped ? handleFlip : undefined}
                >
                    {isFlipped ? (currentCard.back || 'No back content available') : (currentCard.front || 'No front content available')}
                </div>
            </div>

            {isFlipped ? (
                <div className="mt-6 flex justify-around">
                    <button onClick={() => handleReview('Again')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg w-1/4">
                        Again
                    </button>
                    <button onClick={() => handleReview('Hard')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg w-1/4 mx-2">
                        Hard
                    </button>
                    <button onClick={() => handleReview('Good')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-1/4 mx-2">
                        Good
                    </button>
                    <button onClick={() => handleReview('Easy')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg w-1/4">
                        Easy
                    </button>
                </div>
            ) : (
                <div className="mt-6 text-center">
                    <button onClick={handleFlip} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg">
                        Flip
                    </button>
                </div>
            )}
        </div>
    );
};

export default Study;
