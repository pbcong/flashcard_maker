"""
Database setup script for progress tracking tables
"""
from app.db.database import supabase


def create_progress_tables():
    """Create the progress tracking tables in Supabase"""
    
    # SQL for study sessions table
    study_sessions_sql = """
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
    """
    
    # SQL for card reviews table
    card_reviews_sql = """
    CREATE TABLE IF NOT EXISTS card_reviews (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        card_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
        was_correct BOOLEAN NOT NULL,
        response_time_ms INTEGER NOT NULL,
        reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # SQL for indexes
    indexes_sql = """
    CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_study_sessions_set_id ON study_sessions(set_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_user_id ON card_reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_card_id ON card_reviews(card_id);
    CREATE INDEX IF NOT EXISTS idx_card_reviews_session_id ON card_reviews(session_id);
    """
    
    # SQL for RLS policies
    rls_sql = """
    ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY IF NOT EXISTS "Users can only see their own study sessions" ON study_sessions
        FOR ALL USING (auth.uid() = user_id);
        
    CREATE POLICY IF NOT EXISTS "Users can only see their own card reviews" ON card_reviews
        FOR ALL USING (auth.uid() = user_id);
    """
    
    try:
        print("Creating study_sessions table...")
        result = supabase.rpc('exec_sql', {'query': study_sessions_sql}).execute()
        print(f"Study sessions table: {result}")
        
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
        print(study_sessions_sql)
        print(card_reviews_sql) 
        print(indexes_sql)
        print(rls_sql)


if __name__ == "__main__":
    create_progress_tables()
