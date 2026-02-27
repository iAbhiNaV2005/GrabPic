"""
GrabPic — Presigned URL Lambda Handler
Self-contained: includes all helpers inline.
"""

import json
import os
import uuid
import logging

import boto3
from botocore.config import Config as BotoConfig

# Config
S3_BUCKET = os.environ.get("S3_BUCKET", "grabpic-photos")
ALBUMS_TABLE = os.environ.get("ALBUMS_TABLE", "GrabPic-Albums")
PRESIGNED_URL_EXPIRY = int(os.environ.get("PRESIGNED_URL_EXPIRY", "300"))
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_FILE_SIZE_MB", "10"))
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

# Force regional endpoint for presigned URLs (prevents browser CORS redirect issues)
s3_client = boto3.client(
    "s3",
    region_name=os.environ.get("AWS_REGION", "ap-south-1"),
    config=BotoConfig(s3={"addressing_style": "virtual"}, signature_version="s3v4"),
)
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
    """Handle POST /api/albums/{album_id}/upload — Generate presigned URL."""
    logger.info("presigned_url invoked")

    try:
        album_id = event.get("pathParameters", {}).get("album_id")

        if not album_id:
            return build_response(400, {"success": False, "error": "album_id is required"})

        # Verify album exists
        response = albums_table.get_item(Key={"album_id": album_id})
        if not response.get("Item"):
            return build_response(404, {"success": False, "error": "Album not found"})

        # Parse request
        body = json.loads(event.get("body", "{}"))
        file_name = body.get("file_name", "").strip()
        content_type = body.get("content_type", "image/jpeg")

        if not file_name:
            return build_response(400, {"success": False, "error": "file_name is required"})

        # Validate extension
        extension = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""
        if extension not in ALLOWED_EXTENSIONS:
            return build_response(400, {
                "success": False,
                "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            })

        # Generate unique S3 key
        photo_id = str(uuid.uuid4())
        s3_key = f"{album_id}/{photo_id}.{extension}"

        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": s3_key,
                "ContentType": content_type,
            },
            ExpiresIn=PRESIGNED_URL_EXPIRY,
        )

        logger.info(f"Generated presigned URL for {s3_key}")

        return build_response(200, {
            "success": True,
            "data": {
                "presigned_url": presigned_url,
                "s3_key": s3_key,
                "photo_id": photo_id,
                "expires_in": PRESIGNED_URL_EXPIRY,
                "max_file_size_mb": MAX_FILE_SIZE_MB,
            },
        })

    except json.JSONDecodeError:
        return build_response(400, {"success": False, "error": "Invalid JSON in request body"})
    except Exception as e:
        logger.exception("Failed to generate presigned URL")
        return build_response(500, {"success": False, "error": f"Internal server error: {str(e)}"})
