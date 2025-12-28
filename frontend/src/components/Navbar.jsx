import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import logoImg from '../assets/chihuahua1.png';

function Navbar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav 
      className="fixed top-0 left-0 right-0 h-16 z-50 navbar-glass"
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)' }}>
          <img src={logoImg} alt="Flashy logo" className="w-8 h-8 object-contain" />
          {theme === 'binxoai' ? '🎀 Flashy 🐕' : 'Flashy'}
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