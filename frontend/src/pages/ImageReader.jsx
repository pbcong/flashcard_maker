import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ImageReader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [annotatedData, setAnnotatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnnotatedData(null);
      setError(null);
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handleAnnotate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setAnnotatedData(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/v1/pinyin/annotate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to annotate image.');
      }

      setAnnotatedData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnnotated = () => {
    if (!annotatedData) return null;
    const { text, words } = annotatedData;
    const wordMap = words.reduce((acc, w) => ({ ...acc, [w.word]: w.pinyin }), {});
    
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${Object.keys(wordMap).map(escape).join('|')}|[^\\u4e00-\\u9fa5]+)`, 'g');
    const parts = text.split(regex).filter(Boolean);

    return (
      <p className="text-lg leading-relaxed">
        {parts.map((part, i) => {
          const pinyin = wordMap[part];
          return pinyin ? (
            <ruby key={i} className="mx-0.5">
              {part}<rt className="text-xs text-neutral-500">{pinyin}</rt>
            </ruby>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Image Reader</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Upload an image with Chinese text to get Pinyin annotations.
        </p>

        {/* Upload */}
        <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center mb-6">
          <label className="btn-primary cursor-pointer inline-flex">
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          {selectedFile && (
            <p className="text-sm text-neutral-500 mt-2">{selectedFile.name}</p>
          )}
        </div>

        {preview && (
          <button
            onClick={handleAnnotate}
            disabled={loading}
            className="btn-primary mb-6"
          >
            {loading ? <span className="spinner" /> : 'Annotate Image'}
          </button>
        )}

        {error && <div className="alert-error mb-6">{error}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          {preview && (
            <div>
              <h2 className="text-sm font-medium text-neutral-700 mb-2">Original</h2>
              <img src={preview} alt="Preview" className="w-full rounded-lg" />
            </div>
          )}
          {annotatedData && (
            <div>
              <h2 className="text-sm font-medium text-neutral-700 mb-2">Annotated</h2>
              <div className="bg-neutral-50 rounded-lg p-4">
                {renderAnnotated()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageReader;