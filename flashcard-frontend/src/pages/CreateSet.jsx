import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImages } from '../services/api';

const CreateSet = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await uploadImages(files);
      // Navigate to the newly created set
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload images');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Flashcard Set</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload images containing text you want to turn into flashcards
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Processing...' : 'Create Flashcards'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSet;