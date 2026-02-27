"""
GrabPic — Search Faces Lambda Handler
Container-based Lambda: uses face_recognition/dlib for face matching.
Triggered by POST /api/albums/{album_id}/search
"""

import json
import os
import base64
import logging
import tempfile
from decimal import Decimal

import boto3
import numpy as np
import face_recognition
from boto3.dynamodb.conditions import Key

# Config
ALBUMS_TABLE = os.environ.get("ALBUMS_TABLE", "GrabPic-Albums")
PHOTOS_TABLE = os.environ.get("PHOTOS_TABLE", "GrabPic-Photos")
S3_BUCKET = os.environ.get("S3_BUCKET", "grabpic-photos")
FACE_MATCH_THRESHOLD = float(os.environ.get("FACE_MATCH_THRESHOLD", "0.6"))
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

dynamodb = boto3.resource("dynamodb")
s3_client = boto3.client("s3")
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


def get_all_photos(album_id):
    """Query all photos for an album with pagination support."""
    items = []
    kwargs = {
        "KeyConditionExpression": Key("album_id").eq(album_id),
    }
    while True:
        response = photos_table.query(**kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        kwargs["ExclusiveStartKey"] = last_key
    return items


def lambda_handler(event, context):
    """Handle POST /api/albums/{album_id}/search — Find matching photos."""
    logger.info("search_faces invoked")

    try:
        album_id = event.get("pathParameters", {}).get("album_id")

        if not album_id:
            return build_response(400, {"success": False, "error": "album_id is required"})

        # Verify album exists
        album_response = albums_table.get_item(Key={"album_id": album_id})
        album = album_response.get("Item")
        if not album:
            return build_response(404, {"success": False, "error": "Album not found"})

        # Parse selfie image from request
        body = json.loads(event.get("body", "{}"))
        selfie_base64 = body.get("selfie_image", "")

        if not selfie_base64:
            return build_response(400, {"success": False, "error": "selfie_image is required"})

        # Remove data URL prefix if present
        if "," in selfie_base64:
            selfie_base64 = selfie_base64.split(",", 1)[1]

        # Decode and save selfie to temp file
        selfie_bytes = base64.b64decode(selfie_base64)
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp.write(selfie_bytes)
            tmp_path = tmp.name

        # Extract face embedding from selfie
        selfie_image = face_recognition.load_image_file(tmp_path)
        selfie_encodings = face_recognition.face_encodings(selfie_image)

        # Clean up temp file
        os.unlink(tmp_path)

        if not selfie_encodings:
            return build_response(400, {
                "success": False,
                "error": "No face detected in the selfie. Please try with a clearer photo.",
            })

        selfie_embedding = selfie_encodings[0]
        logger.info(f"Selfie face embedding extracted, shape: {selfie_embedding.shape}")

        # Get all processed photos in this album
        photos = get_all_photos(album_id)
        processed_photos = [
            p for p in photos if p.get("processing_status") == "completed"
        ]

        logger.info(f"Comparing against {len(processed_photos)} processed photos")

        # Compare selfie against each photo's face embeddings
        matches = []

        for photo in processed_photos:
            embeddings_data = photo.get("face_embeddings", [])

            if not embeddings_data:
                continue

            for embedding_raw in embeddings_data:
                # Convert Decimal list back to numpy array
                stored_embedding = np.array(
                    [float(x) for x in embedding_raw], dtype=np.float64
                )

                # Calculate Euclidean distance
                distance = np.linalg.norm(selfie_embedding - stored_embedding)

                if distance < FACE_MATCH_THRESHOLD:
                    # Generate presigned URL for the matched photo
                    photo_url = s3_client.generate_presigned_url(
                        "get_object",
                        Params={
                            "Bucket": S3_BUCKET,
                            "Key": photo["s3_key"],
                        },
                        ExpiresIn=3600,
                    )

                    confidence = round((1 - distance / FACE_MATCH_THRESHOLD) * 100, 1)

                    matches.append({
                        "photo_id": photo["photo_id"],
                        "photo_url": photo_url,
                        "distance": round(float(distance), 4),
                        "confidence": max(0, confidence),
                    })
                    break  # One match per photo is enough

        # Sort by distance (best match first)
        matches.sort(key=lambda m: m["distance"])

        logger.info(f"Found {len(matches)} matches")

        return build_response(200, {
            "success": True,
            "data": {
                "matches": matches,
                "total_photos": len(processed_photos),
                "match_count": len(matches),
                "threshold_used": FACE_MATCH_THRESHOLD,
                "album_name": album.get("album_name", ""),
            },
        })

    except json.JSONDecodeError:
        return build_response(400, {"success": False, "error": "Invalid JSON in request body"})
    except Exception as e:
        logger.exception("Failed to search faces")
        return build_response(500, {"success": False, "error": f"Internal server error: {str(e)}"})
