import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFlashcardSets } from '../services/api';

const ViewSet = () => {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const sets = await getFlashcardSets();
        const set = sets.find(s => s.id === parseInt(id));
        if (set) {
          setFlashcardSet(set);
        } else {
          setError('Flashcard set not found');
        }
      } catch (err) {
        setError('Failed to load flashcard set');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [id]);

  const handleNext = () => {
    if (currentCardIndex < flashcardSet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error || !flashcardSet) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Link to="/dashboard" className="text-blue-500 hover:underline mt-4 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentCard = flashcardSet.flashcards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{flashcardSet.title}</h1>
          <Link
            to="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div 
            className="bg-white border-2 border-gray-300 rounded-lg p-10 h-60 flex items-center justify-center cursor-pointer transition-transform duration-500 transform"
            onClick={toggleFlip}
          >
            <p className="text-xl font-medium text-center">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                currentCardIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center">
              <span>
                {currentCardIndex + 1} of {flashcardSet.flashcards.length}
              </span>
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentCardIndex === flashcardSet.flashcards.length - 1}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                currentCardIndex === flashcardSet.flashcards.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSet;