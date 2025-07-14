"""
Database setup script for progress tracking tables
"""
from app.db.database import supabase


def create_progress_tables():
    """Create the progress tracking tables in Supabase"""
    
    
    
    # SQL for card reviews table
    card_reviews_sql = """
    CREATE TABLE IF NOT EXISTS card_reviews (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        was_correct BOOLEAN NOT NULL,
        response_time_ms INTEGER NOT NULL,
        reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # SQL for indexes
    indexes_sql = """
    CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_id ON flashcard_sets(user_id);
    CREATE INDEX IF NOT EXISTS idx_flashcards_set_id ON flashcards(set_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
    """

    # SQL for RLS policies
    rls_sql = """
    ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
    ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can only see their own flashcard sets" ON flashcard_sets;
    CREATE POLICY "Users can only see their own flashcard sets" ON flashcard_sets
        FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can only see their own flashcards" ON flashcards;
    CREATE POLICY "Users can only see their own flashcards" ON flashcards
        FOR ALL USING (set_id IN (SELECT id FROM flashcard_sets WHERE user_id = auth.uid()));

    

    DROP POLICY IF EXISTS "Users can only see their own card reviews" ON card_reviews;
    CREATE POLICY "Users can only see their own card reviews" ON card_reviews
        FOR ALL USING (auth.uid() = user_id);
    """
    
    try:
        
        
        print("Creating card_reviews table...")
        result = supabase.rpc('exec_sql', {'query': card_reviews_sql}).execute()
        print(f"Card reviews table: {result}")
        
        print("Creating indexes...")
        result = supabase.rpc('exec_sql', {'query': indexes_sql}).execute()
        print(f"Indexes: {result}")
        
        print("Setting up RLS policies...")
        result = supabase.rpc('exec_sql', {'query': rls_sql}).execute()
        print(f"RLS policies: {result}")
        
        print("✅ All tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        print("Note: You may need to run this SQL manually in your Supabase dashboard:")
        print("\n--- SQL TO RUN MANUALLY ---")
        
        print(card_reviews_sql) 
        print(indexes_sql)
        print(rls_sql)


if __name__ == "__main__":
    create_progress_tables()
