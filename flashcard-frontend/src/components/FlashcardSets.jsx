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
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Flashcard Sets</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sets.map((set) => (
            <div 
              key={set.id} 
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2 truncate">{set.title}</h2>
              <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{set.description}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                {set.flashcards?.length || 0} cards
              </p>
              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => navigate(`/sets/${set.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex-1 text-center"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex-1 text-center"
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