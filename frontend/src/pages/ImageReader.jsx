import React, { useState } from 'react';
import { Button, Typography, Paper, CircularProgress, Box, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const ImageReader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [annotatedData, setAnnotatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnnotatedData(null); // Reset previous results
      setError(null);
    } else {
      setSelectedFile(null);
      setPreview(null);
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
      // NOTE: We assume the vite proxy is set up for /api to point to the backend
      const response = await fetch('/api/v1/pinyin/annotate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // No 'Content-Type' header, browser sets it for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to annotate image.');
      }

      const data = await response.json();
      setAnnotatedData(data);
    } catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  const renderAnnotatedText = () => {
    if (!annotatedData) return null;

    const { text, words } = annotatedData;
    const wordMap = words.reduce((acc, word) => {
      acc[word.word] = word.pinyin;
      return acc;
    }, {});

    // Create a regex that includes all words and also non-Chinese characters/spaces
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\\]/g, '\\$&');
    };
    const wordKeys = Object.keys(wordMap).map(escapeRegExp);
    const regex = new RegExp(`(${wordKeys.join('|')}|[^\\u4e00-\\u9fa5]+)`, 'g');
    
    const parts = text.split(regex).filter(part => part);

    return (
      <Typography variant="h5" component="div" sx={{ lineHeight: 2.5, p: 1 }}>
        {parts.map((part, index) => {
          const pinyin = wordMap[part];
          if (pinyin) {
            return (
              <ruby key={index} style={{ cursor: 'pointer', margin: '0 2px' }}>
                {part}
                <rt style={{ fontSize: '0.8em' }}>{pinyin}</rt>
              </ruby>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </Typography>
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Interactive Image Reader
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload an image with Chinese text to get interactive Pinyin annotations.
      </Typography>
      
      <Box sx={{ border: '2px dashed grey', p: 3, mb: 3, textAlign: 'center' }}>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {preview && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected: {selectedFile.name}
          </Typography>
        )}
      </Box>

      {preview && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleAnnotate}
          disabled={loading}
          sx={{ mb: 3, minWidth: '150px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Annotate Image'}
        </Button>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {preview && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" gutterBottom>Original Image</Typography>
            <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
          </Box>
        )}
        {annotatedData && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" gutterBottom>Interactive Text</Typography>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              {renderAnnotatedText()}
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ImageReader;