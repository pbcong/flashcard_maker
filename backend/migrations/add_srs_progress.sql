-- Spaced Repetition System (SRS) progress tracking for flashcards

CREATE TABLE IF NOT EXISTS user_flashcard_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    repetitions INTEGER NOT NULL DEFAULT 0,
    interval INTEGER NOT NULL DEFAULT 0,
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, flashcard_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id ON user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_flashcard_id ON user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review_date ON user_flashcard_progress(next_review_date);


-- Enable RLS (Row Level Security) for user data isolation
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_flashcard_progress
DROP POLICY IF EXISTS "Users can only manage their own flashcard progress" ON user_flashcard_progress;
CREATE POLICY "Users can only manage their own flashcard progress" ON user_flashcard_progress
    FOR ALL USING (auth.uid() = user_id);
