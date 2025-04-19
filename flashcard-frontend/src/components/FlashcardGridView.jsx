import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'

function FlashcardGridView() {
  const { setId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [set, setSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCard, setEditingCard] = useState(null)
  const [newCard, setNewCard] = useState({ front: '', back: '' })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchSet()
  }, [setId, token])

  const fetchSet = async () => {
    try {
      const data = await api.getFlashcardSet(setId, token)
      setSet(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      setError('Both front and back are required')
      return
    }

    try {
      const updatedSet = await api.addFlashcardToSet(
        setId,
        { front: newCard.front.trim(), back: newCard.back.trim() },
        token
      )
      setSet(updatedSet)
      setNewCard({ front: '', back: '' })
      setIsAdding(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateCard = async (cardId) => {
    if (!editingCard.front.trim() || !editingCard.back.trim()) {
      setError('Both front and back are required')
      return
    }

    try {
      const updatedSet = await api.updateFlashcard(
        setId,
        cardId,
        { front: editingCard.front.trim(), back: editingCard.back.trim() },
        token
      )
      setSet(updatedSet)
      setEditingCard(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return

    try {
      const updatedSet = await api.deleteFlashcard(setId, cardId, token)
      setSet(updatedSet)
    } catch (err) {
      setError(err.message)
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

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{set?.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/sets/${setId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Study Mode
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Sets
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {set?.flashcards?.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
              {editingCard?.id === card.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingCard.front}
                    onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Front of card"
                  />
                  <textarea
                    value={editingCard.back}
                    onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Back of card"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdateCard(card.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-semibold text-gray-800">{card.front}</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-600">{card.back}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingCard(card)}
                      className="text-blue-600 hover:text-blue-700"
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
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Front of card"
                />
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Back of card"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleAddCard}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewCard({ front: '', back: '' })
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-lg font-medium">Add New Card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardGridView 