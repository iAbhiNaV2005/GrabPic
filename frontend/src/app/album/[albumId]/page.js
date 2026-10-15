"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SelfieCapture from "@/components/SelfieCapture";
import PhotoGrid from "@/components/PhotoGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getAlbum, searchFaces, isMockMode } from "@/lib/api";
import { ScanFace, AlertCircle, RotateCcw, Upload, Sparkles, CheckCircle2 } from "lucide-react";

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
      <div className="page-container page-container--narrow">
        <div className="page-header" style={{ opacity: 0.5 }}>
          <div className="page-icon skeleton" style={{ background: "none" }} />
          <div className="skeleton" style={{ height: 40, width: "60%", margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ height: 20, width: "40%", margin: "0 auto" }} />
        </div>
        <div className="glass-card skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (error && !album) {
    return (
      <div className="page-container page-container--narrow">
        <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
          <AlertCircle size={48} style={{ margin: "0 auto 20px", color: "var(--color-destructive)" }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Album Not Found</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {error}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              <RotateCcw size={16} />
              Try Again
            </button>
            <Link href="/create" className="btn-primary">
              Create New Album
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Album Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="page-header"
      >
        <div className="page-icon">
          <ScanFace size={24} />
        </div>
        <h1>
          {album?.album_name || "Album"}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            alignItems: "center",
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
            {album?.photo_count || 0} photo{album?.photo_count === 1 ? "" : "s"}
          </span>
          {album?.processed_count !== undefined && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color:
                  album.processed_count === album.photo_count && album.photo_count > 0
                    ? "var(--cyan-400)"
                    : "var(--text-muted)",
              }}
            >
              {album.processed_count} ready
            </span>
          )}

          <Link
            href={`/album/${albumId}/upload`}
            className="btn-secondary"
            style={{
              padding: "4px 12px",
              fontSize: 12,
              gap: 6,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Upload size={12} />
            Add Photos
          </Link>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Upload your selfie to find all photos you appear in
        </p>
      </motion.div>

      {/* Selfie Section */}
      {!results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-card" style={{ padding: 36, marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Your Selfie
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
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
                  style={{ marginTop: 28, textAlign: "center" }}
                >
                  <button
                    onClick={handleSearch}
                    className="btn-primary"
                    style={{ padding: "16px 48px", fontSize: 17 }}
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
                <LoadingSpinner text="Analyzing facial vectors & matching across photos..." />
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="inline-error" style={{ marginTop: 20, justifyContent: "center" }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Section */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Searched {results.total_photos} photos · Threshold: {results.threshold_used}
                </p>
                {results.is_user_uploaded && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      color: "var(--color-success)",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    From Your Uploaded Photos
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href={`/album/${albumId}/upload`}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: 14 }}
              >
                <Upload size={14} />
                Upload More
              </Link>
              <button
                onClick={() => {
                  setResults(null);
                  setSelfieImage(null);
                }}
                className="btn-secondary"
                style={{ padding: "8px 20px", fontSize: 14 }}
              >
                <RotateCcw size={14} />
                Search Again
              </button>
            </div>
          </div>

          {/* Photo grid */}
          <PhotoGrid
            photos={results.matches}
            albumName={album?.album_name}
            isDemoSample={results.is_demo_sample}
            albumId={albumId}
          />
        </motion.div>
      )}
    </div>
  );
}
