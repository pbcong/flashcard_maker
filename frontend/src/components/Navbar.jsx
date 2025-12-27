import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)' }}>
          {theme === 'binxoai' ? '🎀 Flashcards 🐕' : 'Flashcards'}
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            title={`Switch to ${theme === 'minimal' ? 'Binxoai' : 'Minimal'} theme`}
          >
            {theme === 'binxoai' ? '🌙' : '✨'}
            <span className="ml-1.5 text-xs">
              {theme === 'binxoai' ? 'Minimal' : 'Binxoai'}
            </span>
          </button>
          
          <Link to="/create" className="btn-primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Set
          </Link>
          <button onClick={logout} className="btn-ghost" style={{ color: 'var(--text-muted)' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;