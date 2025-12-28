import PropTypes from 'prop-types';

function StudyModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex justify-center mb-6">
      <div 
        className="relative inline-flex rounded-2xl p-1"
        style={{ 
          background: 'var(--bg-accent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Sliding highlight */}
        <div 
          className="absolute top-1 bottom-1 rounded-xl transition-all duration-250 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            left: mode === 'flashcard' ? '4px' : 'calc(50% + 0px)',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-glass)',
          }}
        />
        
        {/* Flashcard button */}
        <button
          onClick={() => onModeChange('flashcard')}
          className="relative z-10 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200"
          style={{
            color: mode === 'flashcard' ? 'var(--text-primary)' : 'var(--text-muted)',
            minWidth: '100px',
          }}
        >
          Flashcard
        </button>
        
        {/* MCQ button */}
        <button
          onClick={() => onModeChange('mcq')}
          className="relative z-10 px-5 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200"
          style={{
            color: mode === 'mcq' ? 'var(--text-primary)' : 'var(--text-muted)',
            minWidth: '100px',
          }}
        >
          MCQ
        </button>
      </div>
    </div>
  );
}

StudyModeToggle.propTypes = {
  mode: PropTypes.oneOf(['flashcard', 'mcq']).isRequired,
  onModeChange: PropTypes.func.isRequired,
};

export default StudyModeToggle;
