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
  const { token } = useAuth()

  const fetchSet = useCallback(async () => {
    try {
      const data = await api.getFlashcardSet(setId, token)
      setSet(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setId, token]);

  useEffect(() => {
    fetchSet()
  }, [fetchSet])

  const handleShuffle = () => {
    if (!set) return
    const shuffled = [...set.flashcards].sort(() => Math.random() - 0.5)
    setSet({ ...set, flashcards: shuffled })
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setIsShuffled(true)
  }

  const handleRestart = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    if (isShuffled) {
      fetchSet()
      setIsShuffled(false)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < set.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner w-8 h-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="alert-error mb-4">{error}</div>
        <Link to="/" className="btn-primary">Back to Sets</Link>
      </div>
    )
  }

  if (!set || !set.flashcards?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">No cards found</h2>
        <Link to="/" className="btn-primary">Back to Sets</Link>
      </div>
    )
  }

  const currentCard = set.flashcards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / set.flashcards.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <Link to="/" className="btn-ghost mb-6 inline-flex">← Back</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{set.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Card {currentCardIndex + 1} of {set.flashcards.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/sets/${setId}/study`} className="btn-primary">Study</Link>
          <Link to={`/sets/${setId}/edit`} className="btn-secondary">Edit</Link>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-6">
        <button onClick={handleShuffle} className="btn-ghost text-sm">Shuffle</button>
        <button onClick={handleRestart} className="btn-ghost text-sm">Restart</button>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="card p-8 min-h-[280px] flex items-center justify-center cursor-pointer mb-6"
      >
        <div className="text-center">
          {currentCard.image && (
            <img src={currentCard.image} alt="" className="max-h-32 mx-auto mb-4 rounded" />
          )}
          <p className="text-xl text-neutral-800">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
          {!isFlipped && (
            <p className="text-xs text-neutral-400 mt-4">Click to flip</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevCard}
          disabled={currentCardIndex === 0}
          className="btn-ghost disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={nextCard}
          disabled={currentCardIndex === set.flashcards.length - 1}
          className="btn-ghost disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default FlashcardSetView