/**
 * GrabPic — API Client
 *
 * Handles all API calls to the backend.
 * Uses mock responses in development when API_URL is not set.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const USE_MOCK = !API_URL;

// ============================================================
// Mock Data for Development
// ============================================================
const mockAlbums = {};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

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
    mockAlbums[albumId] = {
      album_id: albumId,
      album_name: albumName,
      photo_count: 0,
      processed_count: 0,
      processing_count: 0,
      created_at: new Date().toISOString(),
    };
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
    const album = mockAlbums[albumId];
    if (!album) {
      // Return a demo album for any ID
      return {
        album_id: albumId,
        album_name: "Summer Trip 2025",
        photo_count: 12,
        processed_count: 12,
        processing_count: 0,
        created_at: new Date().toISOString(),
      };
    }
    return album;
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
  if (USE_MOCK) {
    return {
      presigned_url: `https://mock-s3.example.com/${albumId}/${generateId()}.jpg`,
      photo_id: generateId(),
      s3_key: `${albumId}/${generateId()}.jpg`,
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
 * @param {string} presignedUrl
 * @param {File} file
 * @param {function} onProgress
 */
export async function uploadFileToS3(presignedUrl, file, onProgress) {
  if (USE_MOCK) {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
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
 * @returns {Promise<{matches: Array, total_photos: number, match_count: number}>}
 */
export async function searchFaces(albumId, selfieBase64) {
  if (USE_MOCK) {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2000));
    return {
      matches: [
        {
          photo_id: "mock-1",
          photo_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640",
          distance: 0.35,
          confidence: 41.7,
        },
        {
          photo_id: "mock-2",
          photo_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=640",
          distance: 0.42,
          confidence: 30.0,
        },
        {
          photo_id: "mock-3",
          photo_url: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=640",
          distance: 0.48,
          confidence: 20.0,
        },
        {
          photo_id: "mock-4",
          photo_url: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=640",
          distance: 0.52,
          confidence: 13.3,
        },
      ],
      total_photos: 12,
      match_count: 4,
      threshold_used: 0.6,
      album_name: "Summer Trip 2025",
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
