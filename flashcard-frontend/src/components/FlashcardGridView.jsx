import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '../services/api'

function FlashcardGridView() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [editForm, setEditForm] = useState({ front: '', back: '' })

  useEffect(() => {
    fetchFlashcards()
  }, [setId])

  const fetchFlashcards = async () => {
    try {
      setLoading(true)
      const data = await getFlashcards(setId)
      setFlashcards(data)
      setError(null)
    } catch (err) {
      setError('Failed to load flashcards')
      console.error('Error fetching flashcards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async () => {
    try {
      const newCard = await createFlashcard(setId, {
        front: 'New Card Front',
        back: 'New Card Back'
      })
      setFlashcards([...flashcards, newCard])
    } catch (err) {
      setError('Failed to add new card')
      console.error('Error adding card:', err)
    }
  }

  const handleUpdateCard = async (cardId, updatedData) => {
    try {
      const updatedCard = await updateFlashcard(setId, cardId, updatedData)
      setFlashcards(flashcards.map(card => 
        card.id === cardId ? updatedCard : card
      ))
      setEditingCard(null)
    } catch (err) {
      setError('Failed to update card')
      console.error('Error updating card:', err)
    }
  }

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteFlashcard(setId, cardId)
      setFlashcards(flashcards.filter(card => card.id !== cardId))
    } catch (err) {
      setError('Failed to delete card')
      console.error('Error deleting card:', err)
    }
  }

  const startEditing = (card) => {
    setEditingCard(card.id)
    setEditForm({
      front: card.front,
      back: card.back
    })
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    handleUpdateCard(editingCard, editForm)
  }

  if (loading) {
    return <div className="text-center py-8">Loading flashcards...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Flashcards</h1>
        <button
          onClick={handleAddCard}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Add New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg shadow-md p-6">
            {editingCard === card.id ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Front
                  </label>
                  <input
                    type="text"
                    value={editForm.front}
                    onChange={(e) => setEditForm({...editForm, front: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Back
                  </label>
                  <input
                    type="text"
                    value={editForm.back}
                    onChange={(e) => setEditForm({...editForm, back: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Front</h3>
                  <p className="mt-1 text-gray-600">{card.front}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Back</h3>
                  <p className="mt-1 text-gray-600">{card.back}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditing(card)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlashcardGridView 