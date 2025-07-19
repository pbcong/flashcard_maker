import React, { useState } from 'react';
import { Button, Typography, Paper, CircularProgress, Box, Alert, Switch, FormControlLabel, Modal, Fade } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const ImageReader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [annotatedData, setAnnotatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllPinyin, setShowAllPinyin] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordDetails, setWordDetails] = useState(null);

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

  const handleTogglePinyin = () => {
    setShowAllPinyin(!showAllPinyin);
  };

  const handleWordClick = async (word) => {
    setSelectedWord(word);
    try {
      const response = await fetch(`/api/v1/pinyin/word-info?word=${encodeURIComponent(word)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWordDetails(data);
      } else {
        setWordDetails({ translation: 'Not found', examples: [] });
      }
    } catch (err) {
      setWordDetails({ translation: 'Error fetching details', examples: [] });
    }
  };

  const handleCloseModal = () => {
    setSelectedWord(null);
    setWordDetails(null);
  };

  const renderAnnotatedText = () => {
    if (!annotatedData) return null;

    const { text, words } = annotatedData;

    // Sort words by start just in case
    const sortedWords = [...words].sort((a, b) => a.start - b.start);

    let currentPos = 0;
    const rendered = [];

    for (const { word, pinyin, start, end } of sortedWords) {
      // Add text before this word if any
      if (start > currentPos) {
        rendered.push(<span key={currentPos}>{text.slice(currentPos, start)}</span>);
      }

      // Add the annotated word
      rendered.push(
        <ruby
          key={start}
          style={{ cursor: 'pointer', margin: '0 2px' }}
          onClick={() => handleWordClick(word)}
          onMouseEnter={(e) => !showAllPinyin && (e.currentTarget.querySelector('rt').style.visibility = 'visible')}
          onMouseLeave={(e) => !showAllPinyin && (e.currentTarget.querySelector('rt').style.visibility = 'hidden')}
        >
          {text.slice(start, end + 1)}
          <rt style={{ fontSize: '0.8em', visibility: showAllPinyin ? 'visible' : 'hidden' }}>{pinyin}</rt>
        </ruby>
      );

      currentPos = end + 1;
    }

    // Add any remaining text
    if (currentPos < text.length) {
      rendered.push(<span key={currentPos}>{text.slice(currentPos)}</span>);
    }

    return (
      <Typography variant="h5" component="div" sx={{ lineHeight: 2.5, p: 1 }}>
        {rendered}
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
            <FormControlLabel
              control={<Switch checked={showAllPinyin} onChange={handleTogglePinyin} />}
              label="Show All Pinyin"
            />
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              {renderAnnotatedText()}
            </Paper>
          </Box>
        )}
      </Box>
      <Modal
        open={!!selectedWord}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={!!selectedWord}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <Typography variant="h6">{selectedWord}</Typography>
            {wordDetails ? (
              <>
                <Typography>Translation: {wordDetails.translation}</Typography>
                <Typography>Examples:</Typography>
                {wordDetails.examples.map((ex, i) => <Typography key={i}>{ex}</Typography>)}
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </Fade>
      </Modal>
    </Paper>
  );
};

export default ImageReader;