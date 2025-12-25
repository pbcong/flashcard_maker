import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PinyinReader = () => {
  const [text, setText] = useState('');
  const [annotatedText, setAnnotatedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleAnnotate = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    setAnnotatedText(null);

    try {
      const response = await fetch('/api/v1/pinyin/annotate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to annotate text');
      }

      setAnnotatedText(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnnotated = () => {
    if (!annotatedText) return null;
    const { text: t, words } = annotatedText;
    const wordMap = words.reduce((acc, w) => ({ ...acc, [w.word]: w.pinyin }), {});
    const regex = new RegExp(Object.keys(wordMap).join('|'), 'g');

    let currentPos = 0;
    const parts = [];

    t.replace(regex, (match, offset) => {
      if (offset > currentPos) {
        parts.push({ text: t.substring(currentPos, offset) });
      }
      parts.push({ text: match, pinyin: wordMap[match] });
      currentPos = offset + match.length;
    });

    if (currentPos < t.length) {
      parts.push({ text: t.substring(currentPos) });
    }

    return (
      <p className="text-lg leading-relaxed">
        {parts.map((p, i) =>
          p.pinyin ? (
            <ruby key={i} className="mx-0.5">
              {p.text}<rt className="text-xs text-neutral-500">{p.pinyin}</rt>
            </ruby>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Pinyin Reader</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Enter Chinese text to get Pinyin annotations.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter Chinese text..."
          rows={4}
          className="input resize-none mb-4"
        />

        <button
          onClick={handleAnnotate}
          disabled={loading || !text.trim()}
          className="btn-primary mb-6"
        >
          {loading ? <span className="spinner" /> : 'Annotate'}
        </button>

        {error && <div className="alert-error mb-4">{error}</div>}

        {annotatedText && (
          <div>
            <h2 className="text-sm font-medium text-neutral-700 mb-2">Annotated Text</h2>
            <div className="bg-neutral-50 rounded-lg p-4">
              {renderAnnotated()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinyinReader;