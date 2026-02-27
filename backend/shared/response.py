"""
GrabPic — API Gateway response builder with CORS support.
"""

import json
from .config import ALLOWED_ORIGIN


def build_response(status_code: int, body: dict) -> dict:
    """Build a standardized API Gateway response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        "body": json.dumps(body, default=str),
    }


def success(data: dict, status_code: int = 200) -> dict:
    """Return a success response."""
    return build_response(status_code, {"success": True, "data": data})


def error(message: str, status_code: int = 400) -> dict:
    """Return an error response."""
    return build_response(status_code, {"success": False, "error": message})
