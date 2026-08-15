import sys
import os

# Ensure oracle package in src/ is discoverable on Vercel
src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from oracle.api.main import app

# ASGI entrypoint for Vercel Serverless Functions
__all__ = ["app"]
