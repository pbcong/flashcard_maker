import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  minimal: {
    name: 'Minimal',
    class: 'theme-minimal',
  },
  binxoai: {
    name: 'Binxoai',
    class: 'theme-binxoai',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'minimal';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = themes[theme].class;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'minimal' ? 'binxoai' : 'minimal');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
