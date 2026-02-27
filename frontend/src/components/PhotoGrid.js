"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 48,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 500 }}>No matching photos found</p>
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="photo-card"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.photo_url}
              alt={`Match ${index + 1}`}
              loading="lazy"
            />
            <div className="overlay">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  Match #{index + 1}
                </span>
                {photo.confidence !== undefined && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--cyan-400)",
                      fontWeight: 600,
                      background: "rgba(6, 182, 212, 0.15)",
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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 24,
              cursor: "zoom-out",
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                position: "relative",
              }}
            >
              <img
                src={selectedPhoto.photo_url}
                alt="Full size match"
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 0 60px rgba(124, 58, 237, 0.3)",
                }}
              />

              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: "absolute",
                  top: -12,
                  right: -12,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
                aria-label="Close lightbox"
              >
                ✕
              </button>

              {/* Info bar */}
              {selectedPhoto.confidence !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -48,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--bg-glass)",
                    backdropFilter: "blur(20px)",
                    padding: "8px 20px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: 16,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    Confidence:{" "}
                    <span style={{ color: "var(--cyan-400)", fontWeight: 600 }}>
                      {selectedPhoto.confidence}%
                    </span>
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>•</span>
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
