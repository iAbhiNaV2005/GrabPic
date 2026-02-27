"""
GrabPic — Process Photo Lambda Handler (S3 Trigger)

Triggered when a photo is uploaded to S3. Downloads the image,
detects faces using face_recognition, generates 128-dimension
face embeddings, and stores them in DynamoDB.

This Lambda MUST be deployed as a container image because
face_recognition/dlib requires C++ compilation.
"""

import json
import logging
import uuid
import urllib.parse
from datetime import datetime, timezone
from decimal import Decimal

import boto3
import face_recognition
import numpy as np

import os

from shared.config import S3_BUCKET, LOG_LEVEL
from shared.db import save_photo, increment_photo_count

logger = logging.getLogger()
logger.setLevel(LOG_LEVEL)

s3_client = boto3.client("s3")


def download_image_from_s3(bucket: str, key: str, tmp_path: str) -> str:
    """Download an image from S3 to Lambda's /tmp directory."""
    s3_client.download_file(bucket, key, tmp_path)
    logger.info(f"Downloaded {key} to {tmp_path}")
    return tmp_path


def extract_face_embeddings(image_path: str) -> list:
    """
    Detect faces and generate 128-dimension face embeddings.

    Returns a list of embeddings, one per detected face.
    Each embedding is a list of 128 floats.
    """
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image, model="hog")
    face_encodings = face_recognition.face_encodings(image, face_locations)

    logger.info(f"Detected {len(face_encodings)} face(s) in image")

    # Convert numpy arrays to serializable lists of Decimal for DynamoDB
    embeddings = []
    for encoding in face_encodings:
        embedding = [Decimal(str(round(float(v), 8))) for v in encoding]
        embeddings.append(embedding)

    return embeddings


def lambda_handler(event, context):
    """
    Handle S3 ObjectCreated event — process uploaded photo.

    Event structure:
    {
        "Records": [{
            "s3": {
                "bucket": {"name": "bucket-name"},
                "object": {"key": "album_id/photo_id.jpg"}
            }
        }]
    }
    """
    logger.info("process_photo invoked", extra={"event": json.dumps(event)})

    for record in event.get("Records", []):
        try:
            # Extract S3 info
            bucket = record["s3"]["bucket"]["name"]
            key = urllib.parse.unquote_plus(record["s3"]["object"]["key"])

            logger.info(f"Processing: s3://{bucket}/{key}")

            # Parse album_id and photo_id from S3 key: {album_id}/{photo_id}.{ext}
            parts = key.split("/")
            if len(parts) < 2:
                logger.error(f"Invalid S3 key format: {key}")
                continue

            album_id = parts[0]
            filename = parts[1]
            photo_id = filename.rsplit(".", 1)[0]

            # Download image to /tmp
            tmp_path = f"/tmp/{filename}"
            download_image_from_s3(bucket, key, tmp_path)

            # Extract face embeddings
            embeddings = extract_face_embeddings(tmp_path)

            # Build photo URL
            photo_url = f"https://{bucket}.s3.amazonaws.com/{key}"

            # Save to DynamoDB
            photo_data = {
                "album_id": album_id,
                "photo_id": photo_id,
                "photo_url": photo_url,
                "s3_key": key,
                "face_embeddings": embeddings,
                "face_count": len(embeddings),
                "processing_status": "completed",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            save_photo(photo_data)
            increment_photo_count(album_id)

            logger.info(
                f"Processed photo {photo_id}: {len(embeddings)} face(s) detected"
            )

            # Clean up /tmp
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        except Exception as e:
            logger.exception(f"Failed to process photo from S3: {str(e)}")

            # Save error status to DynamoDB so frontend can show status
            try:
                error_data = {
                    "album_id": album_id,
                    "photo_id": photo_id,
                    "photo_url": f"https://{bucket}.s3.amazonaws.com/{key}",
                    "s3_key": key,
                    "face_embeddings": [],
                    "face_count": 0,
                    "processing_status": "failed",
                    "error_message": str(e),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                save_photo(error_data)
            except Exception:
                logger.exception("Failed to save error status")

    return {"statusCode": 200, "body": "Processing complete"}
