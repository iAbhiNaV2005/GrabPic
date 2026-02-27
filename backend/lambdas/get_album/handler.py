"""
GrabPic — Get Album Lambda Handler
Self-contained: includes all helpers inline.
"""

import json
import os
import logging

import boto3
from boto3.dynamodb.conditions import Key

# Config
ALBUMS_TABLE = os.environ.get("ALBUMS_TABLE", "GrabPic-Albums")
PHOTOS_TABLE = os.environ.get("PHOTOS_TABLE", "GrabPic-Photos")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

dynamodb = boto3.resource("dynamodb")
albums_table = dynamodb.Table(ALBUMS_TABLE)
photos_table = dynamodb.Table(PHOTOS_TABLE)


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
    """Handle GET /api/albums/{album_id} — Get album info."""
    logger.info("get_album invoked")

    try:
        album_id = event.get("pathParameters", {}).get("album_id")

        if not album_id:
            return build_response(400, {"success": False, "error": "album_id is required"})

        response = albums_table.get_item(Key={"album_id": album_id})
        album = response.get("Item")

        if not album:
            return build_response(404, {"success": False, "error": "Album not found"})

        # Get processing status
        photos_response = photos_table.query(
            KeyConditionExpression=Key("album_id").eq(album_id)
        )
        photos = photos_response.get("Items", [])

        processed_count = sum(1 for p in photos if p.get("processing_status") == "completed")
        processing_count = sum(1 for p in photos if p.get("processing_status") == "processing")

        return build_response(200, {
            "success": True,
            "data": {
                "album_id": album["album_id"],
                "album_name": album["album_name"],
                "photo_count": int(album.get("photo_count", 0)),
                "processed_count": processed_count,
                "processing_count": processing_count,
                "created_at": album["created_at"],
            },
        })

    except Exception as e:
        logger.exception("Failed to get album")
        return build_response(500, {"success": False, "error": f"Internal server error: {str(e)}"})
