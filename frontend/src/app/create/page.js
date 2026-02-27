"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createAlbum } from "@/lib/api";

export default function CreateAlbumPage() {
  const router = useRouter();
  const [albumName, setAlbumName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!albumName.trim()) {
      setError("Please enter an album name");
      return;
    }

    if (albumName.length > 100) {
      setError("Album name must be 100 characters or fewer");
      return;
    }

    setLoading(true);
    try {
      const data = await createAlbum(albumName.trim());
      router.push(`/album/${data.album_id}/upload`);
    } catch (err) {
      setError(err.message || "Failed to create album. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
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
            📁
          </motion.div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 8,
              fontFamily: "var(--font-space), sans-serif",
            }}
          >
            Create a New <span className="gradient-text">Album</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Give your album a name to get started
          </p>
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="album-name"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}
              >
                Album Name
              </label>
              <input
                id="album-name"
                type="text"
                className="input-field"
                placeholder="e.g., Summer Road Trip 2025"
                value={albumName}
                onChange={(e) => {
                  setAlbumName(e.target.value);
                  setError("");
                }}
                maxLength={100}
                autoFocus
                disabled={loading}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Choose a descriptive name for your album
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color:
                      albumName.length > 90
                        ? "var(--pink-500)"
                        : "var(--text-muted)",
                  }}
                >
                  {albumName.length}/100
                </span>
              </div>
            </div>

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
                  marginBottom: 20,
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !albumName.trim()}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
                opacity: loading || !albumName.trim() ? 0.6 : 1,
                cursor: loading || !albumName.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating..." : "Create Album & Upload Photos"}
            </button>
          </form>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "•", text: "UUID-protected links" },
            { icon: "•", text: "Instant processing" },
            { icon: "•", text: "Free to use" },
          ].map((item, i) => (
            <span
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              {item.icon} {item.text}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
