-- Progress tracking tables for flashcard application

-- Card reviews table  
CREATE TABLE IF NOT EXISTS card_reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
    was_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);

-- Enable RLS (Row Level Security) for user data isolation
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for card_reviews  
DROP POLICY IF EXISTS "Users can only see their own card reviews" ON card_reviews;
CREATE POLICY "Users can only see their own card reviews" ON card_reviews
    FOR ALL USING (auth.uid() = user_id);