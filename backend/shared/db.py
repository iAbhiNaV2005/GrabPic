"""
GrabPic — DynamoDB helper utilities.
"""

import boto3
from boto3.dynamodb.conditions import Key
from .config import ALBUMS_TABLE, PHOTOS_TABLE


dynamodb = boto3.resource("dynamodb")
albums_table = dynamodb.Table(ALBUMS_TABLE)
photos_table = dynamodb.Table(PHOTOS_TABLE)


def create_album(album_data: dict) -> dict:
    """Create a new album record in DynamoDB."""
    albums_table.put_item(Item=album_data)
    return album_data


def get_album(album_id: str) -> dict | None:
    """Fetch album metadata by album_id."""
    response = albums_table.get_item(Key={"album_id": album_id})
    return response.get("Item")


def increment_photo_count(album_id: str) -> None:
    """Atomically increment the photo_count for an album."""
    albums_table.update_item(
        Key={"album_id": album_id},
        UpdateExpression="SET photo_count = if_not_exists(photo_count, :zero) + :inc",
        ExpressionAttributeValues={":inc": 1, ":zero": 0},
    )


def save_photo(photo_data: dict) -> dict:
    """Save a photo record with face embeddings to DynamoDB."""
    photos_table.put_item(Item=photo_data)
    return photo_data


def get_photos_by_album(album_id: str) -> list:
    """
    Query all photos for an album. Handles pagination for large albums.
    """
    items = []
    response = photos_table.query(
        KeyConditionExpression=Key("album_id").eq(album_id)
    )
    items.extend(response.get("Items", []))

    # Handle pagination for albums with 1000+ photos
    while "LastEvaluatedKey" in response:
        response = photos_table.query(
            KeyConditionExpression=Key("album_id").eq(album_id),
            ExclusiveStartKey=response["LastEvaluatedKey"],
        )
        items.extend(response.get("Items", []))

    return items
