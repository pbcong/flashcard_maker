import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';


const PinyinReader = () => {
  const [text, setText] = useState('');
  const [annotatedText, setAnnotatedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleAnnotate = async () => {
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

      const data = await response.json();
      setAnnotatedText(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnnotatedText = () => {
    if (!annotatedText) return null;

    const { text, words } = annotatedText;
    let currentPos = 0;
    const rendered = [];

    // Create a map of words to their pinyin
    const wordMap = words.reduce((acc, word) => {
        acc[word.word] = word.pinyin;
        return acc;
    }, {});

    // Create a regex to find all the words in the text
    const regex = new RegExp(Object.keys(wordMap).join('|'), 'g');

    text.replace(regex, (match, offset) => {
        // Add the text before the match
        if (offset > currentPos) {
            rendered.push(text.substring(currentPos, offset));
        }

        // Add the annotated word
        rendered.push(
            <ruby key={offset}>
                {match}
                <rt>{wordMap[match]}</rt>
            </ruby>
        );

        currentPos = offset + match.length;
    });

    // Add any remaining text
    if (currentPos < text.length) {
        rendered.push(text.substring(currentPos));
    }

    return <Typography variant="body1" component="div">{rendered}</Typography>;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Pinyin Reader
      </Typography>
      <TextField
        label="Enter Chinese Text"
        multiline
        rows={4}
        fullWidth
        value={text}
        onChange={handleTextChange}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleAnnotate}
        disabled={loading || !text}
      >
        {loading ? <CircularProgress size={24} /> : 'Annotate'}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {annotatedText && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Annotated Text
          </Typography>
          {renderAnnotatedText()}
        </Paper>
      )}
    </Paper>
  );
};

export default PinyinReader;