/**
 * GrabPic — API Client
 *
 * Handles all API calls to the backend.
 * Uses client-side IndexedDB persistence in development when NEXT_PUBLIC_API_URL is not set.
 */

import {
  saveAlbum as saveMockAlbum,
  getAlbumById as getMockAlbumById,
  savePhoto as saveMockPhoto,
  getPhotosForAlbum as getMockPhotosForAlbum,
  fileToDataUrl,
} from "./mockStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const USE_MOCK = !API_URL;

export function isMockMode() {
  return USE_MOCK;
}

export function getApiBaseUrl() {
  return API_URL;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Sample fallback photos if an album is visited with 0 uploaded photos in mock mode
const SAMPLE_DEMO_MATCHES = [
  {
    photo_id: "demo-sample-1",
    photo_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1080&auto=format&fit=crop",
    distance: 0.18,
    confidence: 94.2,
    name: "summer_trip_group_01.jpg",
  },
  {
    photo_id: "demo-sample-2",
    photo_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1080&auto=format&fit=crop",
    distance: 0.25,
    confidence: 88.5,
    name: "mountain_hike_group.jpg",
  },
  {
    photo_id: "demo-sample-3",
    photo_url: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=1080&auto=format&fit=crop",
    distance: 0.32,
    confidence: 81.0,
    name: "beach_party_celebration.jpg",
  },
  {
    photo_id: "demo-sample-4",
    photo_url: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=1080&auto=format&fit=crop",
    distance: 0.38,
    confidence: 76.4,
    name: "sunset_dinner_gathering.jpg",
  },
];

// ============================================================
// API Functions
// ============================================================

/**
 * Create a new album
 * @param {string} albumName
 * @returns {Promise<{album_id: string, album_name: string, share_link: string}>}
 */
export async function createAlbum(albumName) {
  if (USE_MOCK) {
    const albumId = generateId();
    const albumData = {
      album_id: albumId,
      album_name: albumName,
      photo_count: 0,
      processed_count: 0,
      processing_count: 0,
      created_at: new Date().toISOString(),
    };
    await saveMockAlbum(albumData);

    return {
      album_id: albumId,
      album_name: albumName,
      share_link: `/album/${albumId}`,
    };
  }

  const res = await fetch(`${API_URL}/api/albums`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album_name: albumName }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

/**
 * Get album info
 * @param {string} albumId
 * @returns {Promise<Object>}
 */
export async function getAlbum(albumId) {
  if (USE_MOCK) {
    const storedAlbum = await getMockAlbumById(albumId);
    if (storedAlbum) {
      return storedAlbum;
    }

    // Default demo album if not created locally yet
    const demoAlbum = {
      album_id: albumId,
      album_name: "Summer Trip 2025",
      photo_count: 4,
      processed_count: 4,
      processing_count: 0,
      created_at: new Date().toISOString(),
      is_demo: true,
    };
    return demoAlbum;
  }

  const res = await fetch(`${API_URL}/api/albums/${albumId}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

/**
 * Get presigned URL for photo upload
 * @param {string} albumId
 * @param {string} fileName
 * @param {string} contentType
 * @returns {Promise<{presigned_url: string, photo_id: string, s3_key: string}>}
 */
export async function getPresignedUrl(albumId, fileName, contentType) {
  const photoId = generateId();

  if (USE_MOCK) {
    return {
      presigned_url: `https://mock-s3.local/${albumId}/${photoId}`,
      photo_id: photoId,
      s3_key: `${albumId}/${photoId}.${fileName.split(".").pop() || "jpg"}`,
      expires_in: 300,
      max_file_size_mb: 10,
    };
  }

  const res = await fetch(`${API_URL}/api/albums/${albumId}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: fileName, content_type: contentType }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

/**
 * Upload a file to S3 using a presigned URL
 * In mock mode: stores the actual file data into client-side IndexedDB.
 * @param {string} presignedUrl
 * @param {File} file
 * @param {function} onProgress
 * @param {Object} [meta]
 */
export async function uploadFileToS3(presignedUrl, file, onProgress, meta = {}) {
  if (USE_MOCK) {
    // Parse albumId and photoId from meta or presigned URL
    let albumId = meta.albumId;
    let photoId = meta.photoId;

    if (!albumId || !photoId) {
      const match = presignedUrl.match(/mock-s3\.local\/([^/]+)\/([^/?]+)/);
      if (match) {
        albumId = match[1];
        photoId = match[2];
      } else {
        albumId = meta.albumId || "default";
        photoId = meta.photoId || generateId();
      }
    }

    // Convert file to Data URL for persistent local display
    const dataUrl = await fileToDataUrl(file);

    // Save into persistent local mock store
    await saveMockPhoto({
      photo_id: photoId,
      album_id: albumId,
      photo_url: dataUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      created_at: new Date().toISOString(),
    });

    // Simulate upload progress
    for (let i = 25; i <= 100; i += 25) {
      await new Promise((r) => setTimeout(r, 60));
      onProgress?.(i);
    }
    return;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

/**
 * Search for matching photos using a selfie
 * @param {string} albumId
 * @param {string} selfieBase64
 * @returns {Promise<{matches: Array, total_photos: number, match_count: number, is_mock?: boolean}>}
 */
export async function searchFaces(albumId, selfieBase64) {
  if (USE_MOCK) {
    // Simulate realistic AI face recognition delay
    await new Promise((r) => setTimeout(r, 1800));

    const storedAlbum = await getMockAlbumById(albumId);
    const storedPhotos = await getMockPhotosForAlbum(albumId);

    // If the user actually uploaded photos, match on THEIR uploaded photos!
    if (storedPhotos && storedPhotos.length > 0) {
      const matches = storedPhotos.map((photo, index) => {
        // High, realistic confidence scores for matching
        const distance = +(0.15 + index * 0.08).toFixed(3);
        const confidence = +(Math.max(68.5, 96.8 - index * 6.4)).toFixed(1);

        return {
          photo_id: photo.photo_id,
          photo_url: photo.photo_url, // THE USER'S ACTUAL UPLOADED IMAGE!
          name: photo.name,
          distance,
          confidence,
        };
      });

      return {
        matches,
        total_photos: storedPhotos.length,
        match_count: matches.length,
        threshold_used: 0.6,
        album_name: storedAlbum?.album_name || "Album",
        is_mock: true,
        is_user_uploaded: true,
      };
    }

    // If no photos were uploaded yet to this album, fall back to sample demo photos
    return {
      matches: SAMPLE_DEMO_MATCHES,
      total_photos: 4,
      match_count: 4,
      threshold_used: 0.6,
      album_name: storedAlbum?.album_name || "Summer Trip 2025",
      is_mock: true,
      is_demo_sample: true,
    };
  }

  const res = await fetch(`${API_URL}/api/albums/${albumId}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selfie_image: selfieBase64 }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}
