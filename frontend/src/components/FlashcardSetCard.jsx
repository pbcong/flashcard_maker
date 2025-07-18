import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function FlashcardSetCard({ set, handleDelete }) {
  const [activeMenu, setActiveMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setActiveMenu(!activeMenu);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[360px]">
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M8 6h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{set.title}</h2>
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {activeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate(`/sets/${set.id}/edit`);
                      setActiveMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{set.description || 'No description'}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">{set.flashcards?.length || 0} cards</span>
          <span className="text-sm text-gray-600">Last studied: {set.lastStudied || 'Never'}</span>
        </div>
        <div className="w-full bg-gray-200 h-1 rounded-full mb-4">
          <div className="bg-black h-1 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <button
          onClick={() => navigate(`/sets/${set.id}`)}
          className="mt-auto w-full bg-black text-white rounded-lg py-3 px-4 font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
          </svg>
          Study Now
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
    lastStudied: PropTypes.string,
  }).isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default FlashcardSetCard;
