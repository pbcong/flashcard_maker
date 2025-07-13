#!/usr/bin/env python3
"""
Development server startup script for Flashcard Maker backend.
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    """Start the development server with proper configuration."""
    
    # Ensure we're in the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        print("❌ Virtual environment not found!")
        print("Please run: python -m venv venv")
        print("Then activate it and install dependencies: pip install -r requirements.txt")
        sys.exit(1)
    
    # Check if .env file exists
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("⚠️  .env file not found!")
        print("Please create a .env file with your OpenAI API key and Supabase credentials.")
        print("See README.md for required environment variables.")
    
    print("🚀 Starting Flashcard Maker Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔄 Hot reload enabled")
    print()
    
    try:
        # Start the uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
