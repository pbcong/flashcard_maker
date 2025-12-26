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
  const [isEditing, setIsEditing] = useState(false)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')
  const [saving, setSaving] = useState(false)
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

  const nextCard = () => {
    if (currentCardIndex < set.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
      setIsEditing(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
      setIsEditing(false)
    }
  }

  const handleEditClick = () => {
    const currentCard = set.flashcards[currentCardIndex]
    setEditFront(currentCard.front)
    setEditBack(currentCard.back)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFront('')
    setEditBack('')
  }

  const handleSaveEdit = async () => {
    if (!editFront.trim() || !editBack.trim()) return
    
    setSaving(true)
    try {
      // Update the cards array with the edited card
      const updatedCards = set.flashcards.map((card, index) => {
        if (index === currentCardIndex) {
          return { ...card, front: editFront, back: editBack }
        }
        return card
      })
      
      // Send update to API
      await api.updateFlashcardSet(setId, {
        title: set.title,
        description: set.description,
        cards: updatedCards.map(c => ({ front: c.front, back: c.back }))
      }, token)
      
      // Update local state
      setSet({ ...set, flashcards: updatedCards })
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
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
        <button onClick={handleEditClick} className="btn-secondary">
          Edit Card
        </button>
      </div>

      {/* Progress */}
      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-6">
        <button onClick={handleShuffle} className="btn-ghost text-sm">Shuffle</button>
        <button onClick={() => {
          setCurrentCardIndex(0)
          setIsFlipped(false)
          setIsEditing(false)
          if (isShuffled) {
            fetchSet()
            setIsShuffled(false)
          }
        }} className="btn-ghost text-sm">Restart</button>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="card p-6 mb-6 border-2 border-blue-500">
          <h3 className="text-lg font-medium mb-4">Edit Card</h3>
          <div className="space-y-4">
            <div>
              <label className="input-label">Front</label>
              <input
                type="text"
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                className="input"
                placeholder="Front of card"
              />
            </div>
            <div>
              <label className="input-label">Back</label>
              <textarea
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Back of card"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      {!isEditing && (
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
      )}

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