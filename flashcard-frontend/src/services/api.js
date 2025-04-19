const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
};

// Auth endpoints
export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/token`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const register = async (email, password, username) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password, username }),
  });
  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Flashcard set endpoints
export const getFlashcardSets = async () => {
  const response = await fetch(`${API_URL}/flashcard-sets`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getFlashcardSet = async (setId) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createFlashcardSet = async (data) => {
  const response = await fetch(`${API_URL}/flashcard-sets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateFlashcardSet = async (setId, data) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteFlashcardSet = async (setId) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Flashcard endpoints
export const getFlashcards = async (setId) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}/flashcards`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createFlashcard = async (setId, data) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}/flashcards`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateFlashcard = async (setId, cardId, data) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}/flashcards/${cardId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteFlashcard = async (setId, cardId) => {
  const response = await fetch(`${API_URL}/flashcard-sets/${setId}/flashcards/${cardId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Image upload endpoint
export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });
  return handleResponse(response);
};

// API status check
export const checkApiStatus = async () => {
  const response = await fetch(`${API_URL}/`);
  return handleResponse(response);
}; 