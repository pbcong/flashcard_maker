import { useState } from 'react'

function App() {
  const [selectedImages, setSelectedImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    setSelectedImages(files)
    
    // Create preview URLs for the selected images
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setMessage('Please select at least one image')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      selectedImages.forEach((image) => {
        formData.append('files', image)
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload images')
      }

      const data = await response.json()
      setFlashcards(data.flashcards)
      setMessage('Images processed successfully!')
      setCurrentCardIndex(0)
      setIsFlipped(false)
    } catch (error) {
      setMessage('Error processing images: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-8">
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Flashcard Maker</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <label className="block w-full">
              <span className="sr-only">Choose images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
          </div>
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <p className="mt-2 text-sm text-gray-600 truncate">{selectedImages[index].name}</p>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={uploading || selectedImages.length === 0}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
              ${uploading || selectedImages.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {uploading ? 'Processing...' : 'Process Images'}
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-center ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}

        {flashcards.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative">
              <div 
                className={`bg-white rounded-lg shadow-lg p-8 min-h-[200px] flex items-center justify-center cursor-pointer transition-transform duration-500 ${
                  isFlipped ? 'transform rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`text-2xl font-bold ${isFlipped ? 'hidden' : 'block'}`}>
                  {flashcards[currentCardIndex]?.front}
                </div>
                <div className={`text-xl ${isFlipped ? 'block' : 'hidden'}`}>
                  {flashcards[currentCardIndex]?.back}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={previousCard}
                  disabled={currentCardIndex === 0}
                  className={`px-4 py-2 rounded-md ${
                    currentCardIndex === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </span>
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className={`px-4 py-2 rounded-md ${
                    currentCardIndex === flashcards.length - 1
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
