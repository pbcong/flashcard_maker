import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getCurrentUser(token)
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const { access_token } = await api.login(email, password);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const user = await api.getCurrentUser(access_token);
    setUser(user);
  };

  const register = async (email, password, username) => {
    await api.register(email, password, username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}