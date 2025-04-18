import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))