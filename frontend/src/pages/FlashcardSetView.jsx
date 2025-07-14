import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api';

function FlashcardSetView() {
  const { setId } = useParams()
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [viewedCards, setViewedCards] = useState(new Set())
  
  
  const { token } = useAuth()

  const fetchSet = useCallback(async () => {
    try {
      const data = await api.getFlashcardSet(setId, token)
      setSet(data)
      // Reset viewed cards when fetching new set
      setViewedCards(new Set([0]))
      
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setId, token]);

  

  

  useEffect(() => {
    fetchSet()
  }, [fetchSet])

  useEffect(() => {
    // Add current card to viewed cards when it changes
    if (set?.flashcards) {
      setViewedCards(prev => new Set([...prev, currentCardIndex]))
      
    }
  }, [currentCardIndex, set?.flashcards])


  const handleAnswer = async (wasCorrect) => {

    const responseTime = 1000
    const currentCard = set.flashcards[currentCardIndex]

    try {
      // Record the card review
      await api.recordCardReview({
        user_id: '', // Will be set by backend
        card_id: currentCard.id,
        was_correct: wasCorrect,
        response_time_ms: responseTime
      }, token)

      

      // Move to next card
      if (currentCardIndex < set.flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1)
        setIsFlipped(false)
      }
    } catch (err) {
      console.error('Failed to record answer:', err)
    }
  }

  const handleShuffle = () => {
    if (!set) return
    const shuffledCards = [...set.flashcards].sort(() => Math.random() - 0.5)
    setSet({ ...set, flashcards: shuffledCards })
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setIsShuffled(true)
    // Reset viewed cards when shuffling
    setViewedCards(new Set([0]))
    
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (isShuffled) {
      fetchSet() // Reset to original order
      setIsShuffled(false)
    }
    // Reset viewed cards when restarting
    setViewedCards(new Set([0]))
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

  const getProgress = () => {
    if (!set?.flashcards) return 0
    return (viewedCards.size / set.flashcards.length) * 100
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Link
            to="/"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Back to Sets
          </Link>
        </div>
      </div>
    )
  }

  if (!set || !set.flashcards || set.flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Flashcards Found</h2>
          <Link
            to="/"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Back to Sets
          </Link>
        </div>
      </div>
    )
  }

  const currentCard = set.flashcards[currentCardIndex]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Sets
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{set.title}</h1>
          <div className="mt-2 space-y-2">
            <p className="text-gray-600">Card {currentCardIndex + 1} of {set.flashcards.length}</p>
            
            
            
            <div className="w-full bg-gray-200 h-1 rounded-full">
              <div 
                className="bg-black h-1 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mb-6">
          <button
            onClick={handleShuffle}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-shuffle mr-2" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/>
              <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/>
            </svg>
            Shuffle
          </button>
          <button
            onClick={handleRestart}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div 
            className="min-h-[300px] flex items-center justify-center cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center">
              <div className="mb-4">
                {currentCard.image && (
                  <img 
                    src={currentCard.image} 
                    alt="Flashcard" 
                    className="max-w-full max-h-[200px] mx-auto mb-4"
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
              {!isFlipped && (
                <p className="mt-4 text-sm text-gray-500">Click to flip</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={previousCard}
            disabled={currentCardIndex === 0}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Previous
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={!isFlipped}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              I know this
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={!isFlipped}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Still learning
            </button>
          </div>

          <button
            onClick={nextCard}
            disabled={currentCardIndex === set.flashcards.length - 1}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlashcardSetView 