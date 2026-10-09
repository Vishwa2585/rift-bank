import sys
import os

# Add rift-service root to path so `app` package resolves
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
