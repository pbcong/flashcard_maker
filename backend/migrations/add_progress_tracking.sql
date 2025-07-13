-- Progress tracking tables for flashcard application

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    cards_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card reviews table  
CREATE TABLE IF NOT EXISTS card_reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
    was_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_set_id ON study_sessions(set_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_session_id ON card_reviews(session_id);

-- Enable RLS (Row Level Security) for user data isolation
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_sessions
DROP POLICY IF EXISTS "Users can only see their own study sessions" ON study_sessions;
CREATE POLICY "Users can only see their own study sessions" ON study_sessions
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for card_reviews  
DROP POLICY IF EXISTS "Users can only see their own card reviews" ON card_reviews;
CREATE POLICY "Users can only see their own card reviews" ON card_reviews
    FOR ALL USING (auth.uid() = user_id);
