"""
GrabPic — Create Album Lambda Handler
Self-contained: includes all helpers inline (no shared module for zip Lambdas).
"""

import json
import os
import uuid
import logging
from datetime import datetime, timezone

import boto3

# Config
ALBUMS_TABLE = os.environ.get("ALBUMS_TABLE", "GrabPic-Albums")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

dynamodb = boto3.resource("dynamodb")
albums_table = dynamodb.Table(ALBUMS_TABLE)


def build_response(status_code, body):
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


def lambda_handler(event, context):
    """Handle POST /api/albums — Create a new album."""
    logger.info("create_album invoked")

    try:
        body = json.loads(event.get("body", "{}"))
        album_name = body.get("album_name", "").strip()

        if not album_name:
            return build_response(400, {"success": False, "error": "album_name is required"})

        if len(album_name) > 100:
            return build_response(400, {"success": False, "error": "album_name must be 100 characters or fewer"})

        album_id = str(uuid.uuid4())[:8]

        album_data = {
            "album_id": album_id,
            "album_name": album_name,
            "photo_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        albums_table.put_item(Item=album_data)
        logger.info(f"Album created: {album_id}")

        return build_response(201, {
            "success": True,
            "data": {
                "album_id": album_id,
                "album_name": album_name,
                "share_link": f"/album/{album_id}",
            },
        })

    except json.JSONDecodeError:
        return build_response(400, {"success": False, "error": "Invalid JSON in request body"})
    except Exception as e:
        logger.exception("Failed to create album")
        return build_response(500, {"success": False, "error": f"Internal server error: {str(e)}"})
