"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PhotoUploader from "@/components/PhotoUploader";
import { getPresignedUrl, uploadFileToS3 } from "@/lib/api";
import { UploadCloud, PartyPopper, CheckCircle2, XCircle, Clock, Copy, ArrowRight, Upload } from "lucide-react";

export default function UploadPhotosPage() {
  const { albumId } = useParams();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      setError("Please select at least one photo to upload");
      return;
    }

    setUploading(true);
    setError("");
    const progress = {};

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progress[i] = { status: "uploading", percent: 0 };
        setUploadProgress({ ...progress });

        try {
          // Get presigned URL
          const { presigned_url } = await getPresignedUrl(
            albumId,
            file.name,
            file.type
          );

          // Upload to S3
          await uploadFileToS3(presigned_url, file, (percent) => {
            progress[i] = { status: "uploading", percent };
            setUploadProgress({ ...progress });
          });

          progress[i] = { status: "done", percent: 100 };
          setUploadProgress({ ...progress });
        } catch (err) {
          progress[i] = { status: "error", percent: 0, error: err.message };
          setUploadProgress({ ...progress });
        }
      }

      const allDone = Object.values(progress).every(
        (p) => p.status === "done"
      );
      if (allDone) {
        setUploadComplete(true);
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [files, albumId]);

  const totalProgress = files.length > 0
    ? Math.round(
        Object.values(uploadProgress).reduce((acc, p) => acc + (p.percent || 0), 0) /
          files.length
      )
    : 0;

  return (
    <div className="page-container page-container--narrow">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="page-header"
      >
        <div className="page-icon">
          <UploadCloud size={24} />
        </div>
        <h1>
          Upload <span className="gradient-text">Photos</span>
        </h1>
        <p>
          Add your group photos to the album. AI will detect all faces automatically.
        </p>
      </motion.div>

      {/* Upload section */}
      {!uploadComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-card" style={{ padding: 32 }}>
            <PhotoUploader onFilesSelected={setFiles} />

            {/* Upload progress */}
            {uploading && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Uploading...
                  </span>
                  <span
                    className="gradient-text"
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    {totalProgress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>

                {/* Per-file status */}
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {files.map((file, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                        {uploadProgress[i]?.status === "done" ? (
                          <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
                        ) : uploadProgress[i]?.status === "error" ? (
                          <XCircle size={16} style={{ color: "var(--color-destructive)" }} />
                        ) : (
                          <Clock size={16} style={{ color: "var(--text-muted)" }} />
                        )}
                      </span>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </span>
                      <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                        {uploadProgress[i]?.percent || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="inline-error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            {/* Action buttons */}
            {!uploading && files.length > 0 && (
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleUpload}
                  className="btn-primary"
                  style={{ padding: "12px 32px" }}
                >
                  <Upload size={18} />
                  Upload {files.length} Photo{files.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Upload complete */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            padding: 48,
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(8,145,178,0.08))",
          }}
        >
          <div style={{ color: "var(--cyan-400)", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <PartyPopper size={56} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Upload Complete!
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 32,
              fontSize: 15,
            }}
          >
            {files.length} photo{files.length > 1 ? "s" : ""} uploaded successfully.
            AI is now processing faces in the background.
          </p>

          {/* Share link */}
          <div
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Share:
            </span>
            <code
              style={{
                flex: 1,
                fontSize: 14,
                color: "var(--cyan-400)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "left",
              }}
            >
              {typeof window !== "undefined"
                ? `${window.location.origin}/album/${albumId}`
                : `/album/${albumId}`}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/album/${albumId}`
                );
              }}
              className="btn-secondary"
              style={{ padding: "6px 14px", fontSize: 13 }}
            >
              <Copy size={14} />
              Copy
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push(`/album/${albumId}`)}
              className="btn-primary"
              style={{ padding: "12px 32px" }}
            >
              Go to Album
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setFiles([]);
                setUploadProgress({});
                setUploadComplete(false);
              }}
              className="btn-secondary"
              style={{ padding: "12px 32px" }}
            >
              Upload More
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
