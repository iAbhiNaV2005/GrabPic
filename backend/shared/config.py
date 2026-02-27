"""
GrabPic — Centralized configuration from environment variables.
"""

import os


# AWS Resources
S3_BUCKET = os.environ.get("S3_BUCKET", "grabpic-photos")
ALBUMS_TABLE = os.environ.get("ALBUMS_TABLE", "GrabPic-Albums")
PHOTOS_TABLE = os.environ.get("PHOTOS_TABLE", "GrabPic-Photos")

# Face matching
FACE_MATCH_THRESHOLD = float(os.environ.get("FACE_MATCH_THRESHOLD", "0.6"))

# Upload constraints
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", "10"))
PRESIGNED_URL_EXPIRY = int(os.environ.get("PRESIGNED_URL_EXPIRY", "300"))  # 5 minutes
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

# CORS
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

# Logging
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
