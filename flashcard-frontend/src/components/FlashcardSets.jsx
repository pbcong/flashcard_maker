import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'

function FlashcardSets() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSets()
  }, [token])

  const fetchSets = async () => {
    try {
      const data = await api.getFlashcardSets(token)
      setSets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (setId) => {
    if (!window.confirm('Are you sure you want to delete this set?')) return

    try {
      await api.deleteFlashcardSet(setId, token)
      setSets(sets.filter(set => set.id !== setId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Flashcard Sets</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <div key={set.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">{set.title}</h2>
              <p className="text-gray-600 mb-4">{set.description}</p>
              <p className="text-sm text-gray-500 mb-4">
                {set.flashcards?.length || 0} cards
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => navigate(`/sets/${set.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlashcardSets 