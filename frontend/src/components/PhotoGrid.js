"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, X } from "lucide-react";

export default function PhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
        <SearchX size={40} style={{ marginBottom: 16, opacity: 0.6 }} />
        <p style={{ fontSize: 17, fontWeight: 500, color: "var(--text-secondary)" }}>No matching photos found</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>
          Try uploading a clearer selfie with good lighting
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.photo_id}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="photo-card"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.photo_url}
              alt={`Match ${index + 1}`}
              loading="lazy"
            />
            <div className="overlay">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>
                  Match #{index + 1}
                </span>
                {photo.confidence !== undefined && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--cyan-400)",
                      fontWeight: 600,
                      background: "rgba(8, 145, 178, 0.2)",
                      padding: "2px 8px",
                      borderRadius: 20,
                    }}
                  >
                    {photo.confidence}% match
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="lightbox-backdrop"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "85vh", position: "relative" }}
            >
              <img
                src={selectedPhoto.photo_url}
                alt="Full size match"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 0 60px rgba(124, 58, 237, 0.25)",
                }}
              />

              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="lightbox-close"
                aria-label="Close lightbox"
              >
                <X size={16} />
              </button>

              {/* Info bar */}
              {selectedPhoto.confidence !== undefined && (
                <div className="lightbox-info">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Confidence:{" "}
                    <span style={{ color: "var(--cyan-400)", fontWeight: 600 }}>
                      {selectedPhoto.confidence}%
                    </span>
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Distance:{" "}
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {selectedPhoto.distance}
                    </span>
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
