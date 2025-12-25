import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function FlashcardSetCard({ set, handleDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="card-hover flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-1">
            {set.title}
          </h3>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 -mr-1 rounded hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-hover border border-neutral-100 py-1 z-10 animate-fade-in">
                <button
                  onClick={() => {
                    navigate(`/sets/${set.id}/edit`);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
          {set.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{set.flashcards?.length || 0} cards</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <div className="progress-bar mb-4">
          <div className="progress-fill" style={{ width: '75%' }} />
        </div>
        <button
          onClick={() => navigate(`/sets/${set.id}`)}
          className="btn-primary w-full"
        >
          Study
        </button>
      </div>
    </div>
  );
}

FlashcardSetCard.propTypes = {
  set: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    flashcards: PropTypes.array,
  }).isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default FlashcardSetCard;
