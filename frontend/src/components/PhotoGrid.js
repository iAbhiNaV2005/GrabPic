"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchX,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
} from "lucide-react";

export default function PhotoGrid({ photos, albumName, isDemoSample = false, albumId = "" }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageLoadedMap, setImageLoadedMap] = useState({});
  const [imageErrorMap, setImageErrorMap] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadAllProgress, setDownloadAllProgress] = useState(false);

  const selectedPhoto = selectedIndex !== null && photos ? photos[selectedIndex] : null;

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        setSelectedIndex(null);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
      }
    },
    [selectedIndex, photos]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  // Download a photo helper
  const handleDownload = async (e, photo, index) => {
    e?.stopPropagation();
    if (!photo?.photo_url) return;

    setDownloadingId(photo.photo_id || index);

    try {
      const response = await fetch(photo.photo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.name || `grabpic_match_${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Direct link fallback
      const a = document.createElement("a");
      a.href = photo.photo_url;
      a.download = photo.name || `grabpic_match_${index + 1}.jpg`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  // Download all matches sequentially
  const handleDownloadAll = async () => {
    if (!photos || photos.length === 0) return;
    setDownloadAllProgress(true);

    for (let i = 0; i < photos.length; i++) {
      await handleDownload(null, photos[i], i);
      await new Promise((r) => setTimeout(r, 300));
    }
    setDownloadAllProgress(false);
  };

  const getConfidenceBadgeColor = (confidence) => {
    if (confidence >= 85) {
      return {
        bg: "rgba(16, 185, 129, 0.18)",
        color: "#6EE7B7",
        border: "rgba(16, 185, 129, 0.35)",
        label: "High Match",
      };
    }
    if (confidence >= 70) {
      return {
        bg: "rgba(8, 145, 178, 0.18)",
        color: "var(--cyan-400)",
        border: "rgba(8, 145, 178, 0.35)",
        label: "Good Match",
      };
    }
    return {
      bg: "rgba(245, 158, 11, 0.18)",
      color: "#FCD34D",
      border: "rgba(245, 158, 11, 0.35)",
      label: "Match",
    };
  };

  if (!photos || photos.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          textAlign: "center",
          padding: 64,
          color: "var(--text-muted)",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <SearchX size={36} style={{ color: "var(--purple-400)", opacity: 0.8 }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          No Matching Photos Found
        </h3>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
          We could not find your face in this album with high confidence.
        </p>
        <div
          style={{
            background: "rgba(30, 41, 59, 0.4)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            textAlign: "left",
            fontSize: 13,
            color: "var(--text-muted)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Tips for better results:</span>
          <span>• Take a clear selfie in bright lighting facing directly forward</span>
          <span>• Remove sunglasses or hats that obscure facial features</span>
          <span>• Ensure photos in the album have faces clearly in view</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Demo sample alert banner if viewing sample photos */}
      {isDemoSample && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: "14px 20px",
            marginBottom: 20,
            border: "1px solid rgba(124, 58, 237, 0.3)",
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(8, 145, 178, 0.08))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "var(--purple-400)", flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "var(--text-primary)" }}>
              <strong>Demo Preview:</strong> Showing sample trip photos. Upload your own group photos to find yourself!
            </span>
          </div>
          {albumId && (
            <a
              href={`/album/${albumId}/upload`}
              className="btn-primary"
              style={{ padding: "6px 16px", fontSize: 13 }}
            >
              Upload Photos
            </a>
          )}
        </motion.div>
      )}

      {/* Grid Action Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Showing {photos.length} matched photo{photos.length > 1 ? "s" : ""} · Click to view full size
        </span>
        <button
          onClick={handleDownloadAll}
          disabled={downloadAllProgress}
          className="btn-secondary"
          style={{
            padding: "8px 18px",
            fontSize: 13,
            gap: 8,
          }}
        >
          {downloadAllProgress ? (
            <>
              <Check size={14} style={{ color: "var(--color-success)" }} />
              Downloading...
            </>
          ) : (
            <>
              <Download size={14} />
              Download All ({photos.length})
            </>
          )}
        </button>
      </div>

      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.map((photo, index) => {
          const badge = getConfidenceBadgeColor(photo.confidence);
          const isLoaded = imageLoadedMap[photo.photo_id || index];
          const hasError = imageErrorMap[photo.photo_id || index];

          return (
            <motion.div
              key={photo.photo_id || index}
              role="button"
              tabIndex={0}
              aria-label={`View match ${index + 1} with ${photo.confidence}% confidence`}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="photo-card"
              onClick={() => {
                setSelectedIndex(index);
                setIsZoomed(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIndex(index);
                  setIsZoomed(false);
                }
              }}
            >
              {/* Shimmer placeholder before image loads */}
              {!isLoaded && !hasError && (
                <div
                  className="skeleton"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Error fallback card if image fails to load */}
              {hasError ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    background: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                    textAlign: "center",
                  }}
                >
                  <AlertCircle size={32} style={{ marginBottom: 8, color: "var(--color-destructive)" }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                    Image Unavailable
                  </span>
                  <span style={{ fontSize: 11, marginTop: 4 }}>Check AWS S3 permissions</span>
                </div>
              ) : (
                <img
                  src={photo.photo_url}
                  alt={photo.name || `Match ${index + 1}`}
                  loading="lazy"
                  onLoad={() => {
                    setImageLoadedMap((prev) => ({ ...prev, [photo.photo_id || index]: true }));
                  }}
                  onError={() => {
                    setImageErrorMap((prev) => ({ ...prev, [photo.photo_id || index]: true }));
                  }}
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transition: "opacity 200ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              )}

              {/* Overlay with match info and quick download */}
              <div className="overlay">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 13, color: "white", fontWeight: 600 }}>
                      Match #{index + 1}
                    </span>
                    {photo.name && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255, 255, 255, 0.7)",
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {photo.name}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {photo.confidence !== undefined && (
                      <span
                        style={{
                          fontSize: 12,
                          color: badge.color,
                          fontWeight: 700,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          padding: "3px 10px",
                          borderRadius: 20,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {photo.confidence}%
                      </span>
                    )}

                    {/* Quick download button on card */}
                    <button
                      onClick={(e) => handleDownload(e, photo, index)}
                      className="btn-secondary"
                      style={{
                        padding: 6,
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        background: "rgba(15, 23, 42, 0.7)",
                        color: "white",
                      }}
                      aria-label={`Download photo ${index + 1}`}
                      title="Download photo"
                    >
                      {downloadingId === (photo.photo_id || index) ? (
                        <Check size={14} style={{ color: "var(--color-success)" }} />
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedIndex(null);
              setIsZoomed(false);
            }}
            className="lightbox-backdrop"
            style={{
              zIndex: 100,
              background: "rgba(10, 15, 29, 0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Top Bar with counter, download, and close button */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: 20,
                left: 24,
                right: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 110,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    background: "rgba(30, 41, 59, 0.8)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {selectedIndex + 1} of {photos.length}
                </span>

                {selectedPhoto.confidence !== undefined && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: getConfidenceBadgeColor(selectedPhoto.confidence).color,
                      background: getConfidenceBadgeColor(selectedPhoto.confidence).bg,
                      border: `1px solid ${getConfidenceBadgeColor(selectedPhoto.confidence).border}`,
                      padding: "5px 12px",
                      borderRadius: 20,
                    }}
                  >
                    {selectedPhoto.confidence}% Match
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="btn-secondary"
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    gap: 6,
                    background: "rgba(30, 41, 59, 0.8)",
                  }}
                  title={isZoomed ? "Zoom out" : "Zoom in"}
                >
                  {isZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                  <span className="hidden sm:inline">{isZoomed ? "Zoom Out" : "Zoom"}</span>
                </button>

                <button
                  onClick={(e) => handleDownload(e, selectedPhoto, selectedIndex)}
                  className="btn-primary"
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    gap: 6,
                  }}
                  title="Download photo"
                >
                  {downloadingId === (selectedPhoto.photo_id || selectedIndex) ? (
                    <>
                      <Check size={15} />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      Download
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedIndex(null);
                    setIsZoomed(false);
                  }}
                  className="lightbox-close"
                  aria-label="Close lightbox"
                  style={{
                    position: "static",
                    marginLeft: 6,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Previous Navigation Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                  setIsZoomed(false);
                }}
                className="btn-secondary"
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 110,
                  padding: 12,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid var(--border-subtle)",
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Next Navigation Button */}
            {photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                  setIsZoomed(false);
                }}
                className="btn-secondary"
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 110,
                  padding: 12,
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid var(--border-subtle)",
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Center Content Area */}
            <motion.div
              key={selectedPhoto.photo_id || selectedIndex}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: isZoomed ? 1.25 : 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: isZoomed ? "95vw" : "85vw",
                maxHeight: isZoomed ? "90vh" : "78vh",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: isZoomed ? "zoom-out" : "default",
                transition: "transform 250ms ease",
              }}
            >
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.name || `Full size match ${selectedIndex + 1}`}
                onClick={() => setIsZoomed(!isZoomed)}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 0 80px rgba(124, 58, 237, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  cursor: isZoomed ? "zoom-out" : "zoom-in",
                }}
              />

              {/* Bottom Info Bar */}
              <div
                style={{
                  marginTop: 16,
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 24,
                  padding: "8px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 13,
                  backdropFilter: "blur(12px)",
                }}
              >
                {selectedPhoto.name && (
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {selectedPhoto.name}
                  </span>
                )}
                {selectedPhoto.distance !== undefined && (
                  <span style={{ color: "var(--text-muted)" }}>
                    Euclidean Distance:{" "}
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                      {selectedPhoto.distance}
                    </span>
                  </span>
                )}
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span style={{ color: "var(--text-muted)" }}>
                  Use <kbd style={{ padding: "2px 6px", background: "var(--bg-tertiary)", borderRadius: 4 }}>←</kbd> <kbd style={{ padding: "2px 6px", background: "var(--bg-tertiary)", borderRadius: 4 }}>→</kbd> keys to navigate
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
