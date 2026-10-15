/**
 * GrabPic — Client-Side Mock Store (IndexedDB + Memory Fallback)
 *
 * Persists albums and uploaded photos locally in the browser when running
 * in development/mock mode without an AWS backend.
 *
 * This ensures:
 * 1. Uploaded photos are actually saved and preserved across navigation.
 * 2. Facial search returns the user's actual uploaded photos rather than static placeholders.
 * 3. Albums retain their accurate photo counts and processing status.
 */

const DB_NAME = "GrabPic_DevStore";
const DB_VERSION = 1;
const ALBUMS_STORE = "albums";
const PHOTOS_STORE = "photos";

// In-memory fallback if IndexedDB is unavailable
const memoryFallback = {
  albums: {},
  photos: {},
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * Open or upgrade the IndexedDB database
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      return resolve(null);
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(ALBUMS_STORE)) {
          db.createObjectStore(ALBUMS_STORE, { keyPath: "album_id" });
        }
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          const photoStore = db.createObjectStore(PHOTOS_STORE, { keyPath: "photo_id" });
          photoStore.createIndex("album_id", "album_id", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("IndexedDB failed to open, using memory store:", request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB error:", err);
      resolve(null);
    }
  });
}

/**
 * Save or update an album
 */
export async function saveAlbum(album) {
  const db = await openDB();
  if (!db) {
    memoryFallback.albums[album.album_id] = { ...album };
    return album;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(ALBUMS_STORE, "readwrite");
      const store = tx.objectStore(ALBUMS_STORE);
      store.put(album);
      tx.oncomplete = () => resolve(album);
      tx.onerror = () => {
        memoryFallback.albums[album.album_id] = { ...album };
        resolve(album);
      };
    } catch {
      memoryFallback.albums[album.album_id] = { ...album };
      resolve(album);
    }
  });
}

/**
 * Retrieve an album by ID
 */
export async function getAlbumById(albumId) {
  const db = await openDB();
  if (!db) {
    return memoryFallback.albums[albumId] || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ALBUMS_STORE, "readonly");
      const store = tx.objectStore(ALBUMS_STORE);
      const request = store.get(albumId);
      request.onsuccess = () => resolve(request.result || memoryFallback.albums[albumId] || null);
      request.onerror = () => resolve(memoryFallback.albums[albumId] || null);
    } catch {
      resolve(memoryFallback.albums[albumId] || null);
    }
  });
}

/**
 * Save an uploaded photo to the album
 */
export async function savePhoto(photo) {
  const db = await openDB();
  if (!db) {
    if (!memoryFallback.photos[photo.album_id]) {
      memoryFallback.photos[photo.album_id] = [];
    }
    memoryFallback.photos[photo.album_id].push(photo);
    return photo;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([PHOTOS_STORE, ALBUMS_STORE], "readwrite");
      const photoStore = tx.objectStore(PHOTOS_STORE);
      const albumStore = tx.objectStore(ALBUMS_STORE);

      photoStore.put(photo);

      // Also update album photo counts
      const albumReq = albumStore.get(photo.album_id);
      albumReq.onsuccess = () => {
        const album = albumReq.result;
        if (album) {
          album.photo_count = (album.photo_count || 0) + 1;
          album.processed_count = (album.processed_count || 0) + 1;
          albumStore.put(album);
        }
      };

      tx.oncomplete = () => resolve(photo);
      tx.onerror = () => {
        if (!memoryFallback.photos[photo.album_id]) {
          memoryFallback.photos[photo.album_id] = [];
        }
        memoryFallback.photos[photo.album_id].push(photo);
        resolve(photo);
      };
    } catch {
      if (!memoryFallback.photos[photo.album_id]) {
        memoryFallback.photos[photo.album_id] = [];
      }
      memoryFallback.photos[photo.album_id].push(photo);
      resolve(photo);
    }
  });
}

/**
 * Get all uploaded photos for an album
 */
export async function getPhotosForAlbum(albumId) {
  const db = await openDB();
  if (!db) {
    return memoryFallback.photos[albumId] || [];
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(PHOTOS_STORE, "readonly");
      const store = tx.objectStore(PHOTOS_STORE);
      const index = store.index("album_id");
      const request = index.getAll(albumId);

      request.onsuccess = () => {
        const items = request.result || [];
        if (items.length === 0 && memoryFallback.photos[albumId]) {
          resolve(memoryFallback.photos[albumId]);
        } else {
          resolve(items);
        }
      };
      request.onerror = () => resolve(memoryFallback.photos[albumId] || []);
    } catch {
      resolve(memoryFallback.photos[albumId] || []);
    }
  });
}

/**
 * Convert a File or Blob into a base64 Data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
