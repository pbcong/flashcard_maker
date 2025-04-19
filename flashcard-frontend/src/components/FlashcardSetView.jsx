import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'

function FlashcardSetView() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const { token } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchSet()
  }, [setId, token])

  const fetchSet = async () => {
    try {
      const data = await api.getFlashcardSet(setId, token)
      setSet(data)
      setNewTitle(data.title)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTitleUpdate = async () => {
    if (!newTitle.trim()) {
      setError('Title cannot be empty')
      return
    }

    setIsUpdating(true)
    setError('')

    try {
      const updatedSet = await api.updateFlashcardSet(
        setId,
        { title: newTitle.trim() },
        token
      )
      setSet(updatedSet)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < set.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Sets
          </button>
        </div>
      </div>
    )
  }

  if (!set || !set.flashcards || set.flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Flashcards Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Back to Sets
          </button>
        </div>
      </div>
    )
  }

  const currentCard = set.flashcards[currentCardIndex]

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-2xl sm:text-3xl font-bold text-gray-800 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none w-full"
                disabled={isUpdating}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleTitleUpdate}
                  disabled={isUpdating}
                  className={`bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-md transition-colors duration-200 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setNewTitle(set.title)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{set.title}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 w-full sm:w-auto text-center"
          >
            Back to Sets
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col items-center">
            <div 
              className="flashcard-container w-full max-w-2xl h-48 sm:h-64 mb-6 sm:mb-8 perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                className={`flashcard w-full h-full relative transition-transform duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                <div className="flashcard-front absolute w-full h-full bg-white rounded-lg shadow-md flex items-center justify-center backface-hidden">
                  <div className="text-xl sm:text-2xl font-bold text-center p-4 sm:p-8">
                    {currentCard.front}
                  </div>
                </div>
                <div className="flashcard-back absolute w-full h-full bg-white rounded-lg shadow-md flex items-center justify-center backface-hidden rotate-y-180">
                  <div className="text-lg sm:text-xl text-center p-4 sm:p-8">
                    {currentCard.back}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center w-full max-w-2xl">
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  currentCardIndex === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                }`}
              >
                Previous
              </button>
              <span className="text-gray-600 text-sm sm:text-base">
                Card {currentCardIndex + 1} of {set.flashcards.length}
              </span>
              <button
                onClick={nextCard}
                disabled={currentCardIndex === set.flashcards.length - 1}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  currentCardIndex === set.flashcards.length - 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashcardSetView 