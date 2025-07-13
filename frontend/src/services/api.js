const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL;

console.log('API Configuration:', { API_URL, API_BASE });

export const api = {
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  async register(email, password, username) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },

  async uploadImages(formData, token) {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  async getFlashcardSets(token) {
    const response = await fetch(`${API_BASE}/flashcard-sets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flashcard sets');
    }

    return response.json();
  },

  async getFlashcardSet(setId, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets/${setId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flashcard set');
    }

    return response.json();
  },

  async deleteFlashcardSet(setId, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets/${setId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete flashcard set');
    }

    return response.json();
  },

  async updateFlashcardSet(setId, data, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets/${setId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update flashcard set');
    }

    return response.json();
  },

  async createFlashcardSet(data, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create flashcard set');
    }

    return response.json();
  },

  // Progress tracking methods
  async startStudySession(setId, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets/${setId}/study-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to start study session');
    }

    return response.json();
  },

  async endStudySession(sessionId, data, token) {
    const response = await fetch(`${API_BASE}/study-session/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to end study session');
    }

    return response.json();
  },

  async recordCardReview(reviewData, token) {
    const response = await fetch(`${API_BASE}/card-review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error('Failed to record review');
    }

    return response.json();
  },

  async getStudyProgress(setId, token) {
    const response = await fetch(`${API_BASE}/flashcard-sets/${setId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get progress');
    }

    return response.json();
  },
};