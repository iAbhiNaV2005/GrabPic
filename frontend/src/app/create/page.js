"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createAlbum } from "@/lib/api";
import { FolderPlus, Shield, Zap, Heart } from "lucide-react";

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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 520 }}
      >
        {/* Header */}
        <div className="page-header">
          <div className="page-icon">
            <FolderPlus size={24} />
          </div>
          <h1>
            Create a New <span className="gradient-text">Album</span>
          </h1>
          <p>Give your album a name to get started</p>
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
              <div
                className="inline-error"
                style={{ marginBottom: 20 }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !albumName.trim()}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
              }}
            >
              {loading ? "Creating..." : "Create Album & Upload Photos"}
            </button>
          </form>
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Shield, text: "UUID-protected links" },
            { icon: Zap, text: "Instant processing" },
            { icon: Heart, text: "Free to use" },
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
              <item.icon size={13} />
              {item.text}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
