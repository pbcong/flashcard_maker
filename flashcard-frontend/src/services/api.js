import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/token', formData);
  return response.data;
};

export const register = async (email, password, username) => {
  const response = await api.post('/register', { email, password, username });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Flashcard set endpoints
export const getFlashcardSets = async () => {
  const response = await api.get('/flashcard-sets');
  return response.data;
};

export const getFlashcardSet = async (setId) => {
  const response = await api.get(`/flashcard-sets/${setId}`);
  return response.data;
};

export const createFlashcardSet = async (data) => {
  const response = await api.post('/flashcard-sets', data);
  return response.data;
};

export const updateFlashcardSet = async (setId, data) => {
  const response = await api.patch(`/flashcard-sets/${setId}`, data);
  return response.data;
};

export const deleteFlashcardSet = async (setId) => {
  const response = await api.delete(`/flashcard-sets/${setId}`);
  return response.data;
};

// Flashcard endpoints
export const getFlashcards = async (setId) => {
  const response = await api.get(`/flashcard-sets/${setId}/flashcards`);
  return response.data;
};

export const createFlashcard = async (setId, data) => {
  const response = await api.post(`/flashcard-sets/${setId}/flashcards`, data);
  return response.data;
};

export const updateFlashcard = async (setId, cardId, data) => {
  const response = await api.patch(`/flashcard-sets/${setId}/flashcards/${cardId}`, data);
  return response.data;
};

export const deleteFlashcard = async (setId, cardId) => {
  const response = await api.delete(`/flashcard-sets/${setId}/flashcards/${cardId}`);
  return response.data;
};

// Image upload endpoint
export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// API status check
export const checkApiStatus = async () => {
  const response = await api.get('/');
  return response.data;
}; 