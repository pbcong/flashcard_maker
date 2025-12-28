import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

function MCQCard({ card, allCards, onNext, onAnswer, currentIndex, totalCards }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate shuffled choices when card changes
  const choices = useMemo(() => {
    const correctAnswer = card.back;
    
    // Get other cards' backs as distractors (exclude current card)
    const otherBacks = allCards
      .filter((c, idx) => idx !== currentIndex)
      .map(c => c.back);
    
    // Shuffle and pick up to 3 distractors
    const shuffledOthers = [...otherBacks].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3);
    
    // If we don't have enough distractors, that's okay
    const allChoices = [correctAnswer, ...distractors];
    
    // Shuffle all choices
    return allChoices.sort(() => Math.random() - 0.5);
  }, [card, allCards, currentIndex]);

  // Reset state when card changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [card]);

  const handleSelect = (choice) => {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);
    // Report if answer was correct
    if (onAnswer) {
      onAnswer(choice === card.back);
    }
  };

  const isCorrect = selectedAnswer === card.back;

  const getChoiceStyle = (choice) => {
    if (!isAnswered) {
      return {
        background: 'var(--bg-secondary)',
        border: '2px solid var(--border-glass)',
      };
    }
    
    if (choice === card.back) {
      // Correct answer - always show green
      return {
        background: 'rgba(34, 197, 94, 0.15)',
        border: '2px solid rgba(34, 197, 94, 0.5)',
        color: '#166534',
      };
    }
    
    if (choice === selectedAnswer && choice !== card.back) {
      // Selected wrong answer - show red
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '2px solid rgba(239, 68, 68, 0.5)',
        color: '#dc2626',
      };
    }
    
    // Other choices - dim them
    return {
      background: 'var(--bg-accent)',
      border: '2px solid var(--border-color)',
      opacity: 0.5,
    };
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div 
        className="card-glass p-8 min-h-[140px] flex items-center justify-center"
      >
        <div className="text-center">
          {card.image && (
            <img src={card.image} alt="" className="max-h-24 mx-auto mb-4 rounded" />
          )}
          <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            {card.front}
          </p>
        </div>
      </div>

      {/* Answer Choices */}
      <div className="grid gap-3">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleSelect(choice)}
            disabled={isAnswered}
            className="p-4 rounded-xl text-left transition-all duration-200 backdrop-blur-sm"
            style={{
              ...getChoiceStyle(choice),
              cursor: isAnswered ? 'default' : 'pointer',
            }}
          >
            <div className="flex items-start gap-3">
              <span 
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  background: 'var(--bg-accent)',
                  color: 'var(--text-secondary)',
                }}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span style={{ color: getChoiceStyle(choice).color || 'var(--text-primary)' }}>
                {choice}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback & Next - Always reserve space to prevent layout shift */}
      <div className="h-12 flex items-center justify-between">
        {isAnswered ? (
          <>
            <p 
              className="text-sm font-medium"
              style={{ color: isCorrect ? '#166534' : '#dc2626' }}
            >
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <button
              onClick={onNext}
              className="btn-primary"
            >
              {currentIndex < totalCards - 1 ? 'Next →' : 'Finish'}
            </button>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Select an answer
          </p>
        )}
      </div>
    </div>
  );
}

MCQCard.propTypes = {
  card: PropTypes.shape({
    front: PropTypes.string.isRequired,
    back: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  allCards: PropTypes.array.isRequired,
  onNext: PropTypes.func.isRequired,
  onAnswer: PropTypes.func,
  currentIndex: PropTypes.number.isRequired,
  totalCards: PropTypes.number.isRequired,
};

export default MCQCard;
