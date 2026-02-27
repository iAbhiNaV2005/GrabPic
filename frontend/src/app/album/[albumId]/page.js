"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SelfieCapture from "@/components/SelfieCapture";
import PhotoGrid from "@/components/PhotoGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getAlbum, searchFaces } from "@/lib/api";

export default function AlbumPage() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selfieImage, setSelfieImage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const data = await getAlbum(albumId);
        setAlbum(data);
      } catch (err) {
        setError("Album not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    }
    fetchAlbum();
  }, [albumId]);

  const handleSearch = async () => {
    if (!selfieImage) {
      setError("Please capture or upload a selfie first");
      return;
    }

    setSearching(true);
    setError("");
    setResults(null);

    try {
      const data = await searchFaces(albumId, selfieImage);
      setResults(data);
    } catch (err) {
      setError(err.message || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingSpinner text="Loading album..." />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}
    >
      {/* Album Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 20px",
          }}
        >
          🔍
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
            fontFamily: "var(--font-space), sans-serif",
          }}
        >
          {album?.album_name || "Album"}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            {album?.photo_count || 0} photos
          </span>
          {album?.processed_count !== undefined && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color:
                  album.processed_count === album.photo_count
                    ? "var(--cyan-400)"
                    : "var(--text-muted)",
              }}
            >
              {album.processed_count} processed
            </span>
          )}
        </div>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Upload your selfie to find all photos you appear in
        </p>
      </motion.div>

      {/* Selfie Section */}
      {!results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card" style={{ padding: 36, marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                fontFamily: "var(--font-space), sans-serif",
              }}
            >
              Your Selfie
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              Take a selfie or upload a clear photo of your face for the best results
            </p>

            <SelfieCapture
              onCapture={(base64) => {
                setSelfieImage(base64);
                setError("");
              }}
            />

            {/* Search button */}
            <AnimatePresence>
              {selfieImage && !searching && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 28,
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={handleSearch}
                    className="btn-primary"
                    style={{
                      padding: "16px 48px",
                      fontSize: 17,
                    }}
                  >
                    Find My Photos
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Searching */}
            {searching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: 24 }}
              >
                <LoadingSpinner text="Analyzing faces... This may take a moment." />
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  color: "#f87171",
                  fontSize: 14,
                  marginTop: 20,
                  textAlign: "center",
                }}
              >
                {error}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Results header */}
          <div
            className="glass-card"
            style={{
              padding: "20px 28px",
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "var(--font-space), sans-serif",
                  marginBottom: 4,
                }}
              >
                {results.match_count > 0 ? (
                  <>
                    Found{" "}
                    <span className="gradient-text">
                      {results.match_count} photo{results.match_count > 1 ? "s" : ""}
                    </span>
                  </>
                ) : (
                  "No Matches Found"
                )}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Searched {results.total_photos} photos •
                Threshold: {results.threshold_used}
              </p>
            </div>
            <button
              onClick={() => {
                setResults(null);
                setSelfieImage(null);
              }}
              className="btn-secondary"
              style={{ padding: "8px 20px", fontSize: 14 }}
            >
              ↻ Search Again
            </button>
          </div>

          {/* Photo grid */}
          <PhotoGrid photos={results.matches} />

          {/* Download all hint */}
          {results.match_count > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
                marginTop: 32,
              }}
            >
              Click on any photo to view it in full size
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}
