const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_URL}/v1`;

console.log('API Configuration:', { API_URL, API_BASE });

// LRU Cache with fixed size to limit RAM usage
// When cache is full, least recently used items are evicted
const MAX_CACHE_SIZE = 50; // Maximum number of cached items
const CACHE_TTL = 300000; // 5 minutes default TTL

class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Map maintains insertion order
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    const item = this.cache.get(key);
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (most recently used) by re-inserting
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.data;
  }

  set(key, data, ttl = CACHE_TTL) {
    // If key exists, delete it first (will be re-added at the end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // If at capacity, delete the oldest item (first item in Map)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, { data, expiry: Date.now() + ttl });
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

const cache = new LRUCache(MAX_CACHE_SIZE);

function getCached(key) {
  return cache.get(key);
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, data, ttl);
}

function invalidateCache(pattern) {
  cache.invalidate(pattern);
}

// Handle session expiry - redirect to login
function handleUnauthorized() {
  localStorage.removeItem('token');
  cache.clear();
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// Wrapper to handle 401 responses
async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }
  
  return response;
}

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
    const cacheKey = `user:${token.slice(-10)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await fetchWithAuth(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const data = await response.json();
    setCache(cacheKey, data, 600000); // Cache for 10 minutes
    return data;
  },

  async uploadFiles(formData, token, options = {}) {
    if (options.backLanguage) {
      formData.append('back_language', options.backLanguage);
    }
    
    const response = await fetchWithAuth(`${API_BASE}/upload`, {
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

    invalidateCache('flashcard-sets');
    return response.json();
  },

  async getFlashcardSets(token) {
    const cacheKey = `flashcard-sets:${token.slice(-10)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await fetchWithAuth(`${API_BASE}/flashcard-sets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flashcard sets');
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  async getFlashcardSet(setId, token) {
    const cacheKey = `flashcard-set:${setId}:${token.slice(-10)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await fetchWithAuth(`${API_BASE}/flashcard-sets/${setId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch flashcard set');
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  },

  async deleteFlashcardSet(setId, token) {
    const response = await fetchWithAuth(`${API_BASE}/flashcard-sets/${setId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete flashcard set');
    }

    invalidateCache('flashcard-set');
    return response.json();
  },

  async updateFlashcardSet(setId, data, token) {
    const response = await fetchWithAuth(`${API_BASE}/flashcard-sets/${setId}`, {
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

    invalidateCache(`flashcard-set:${setId}`);
    invalidateCache('flashcard-sets');
    return response.json();
  },

  async createFlashcardSet(data, token) {
    const response = await fetchWithAuth(`${API_BASE}/flashcard-sets`, {
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

    invalidateCache('flashcard-sets');
    return response.json();
  },

  async recordCardReview(reviewData, token) {
    const response = await fetchWithAuth(`${API_BASE}/card-review`, {
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

  async getDueCards(setId, token) {
    const cacheKey = `due-cards:${setId}:${token.slice(-10)}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const response = await fetchWithAuth(`${API_BASE}/reviews/due/${setId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch due cards');
    }

    const data = await response.json();
    setCache(cacheKey, data, 60000); // Cache due cards for 1 minute
    return data;
  },

  async submitReview(reviewData, token) {
    const response = await fetchWithAuth(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }

    invalidateCache('due-cards');
    return response.json();
  },

  async generateFromText(text, backLanguage, token) {
    const response = await fetchWithAuth(`${API_BASE}/upload/generate-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, back_language: backLanguage }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate flashcards');
    }

    return response.json();
  },

  // Clear all cache
  clearCache() {
    cache.clear();
  },
};