"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoUploader({ onFilesSelected, maxSizeMB = 10 }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const maxSize = maxSizeMB * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  const validateFiles = useCallback(
    (fileList) => {
      const valid = [];
      const errors = [];

      Array.from(fileList).forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid type. Only JPG/PNG allowed.`);
        } else if (file.size > maxSize) {
          errors.push(`${file.name}: Exceeds ${maxSizeMB}MB limit.`);
        } else {
          valid.push(file);
        }
      });

      return { valid, errors };
    },
    [maxSize, maxSizeMB]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const { valid, errors } = validateFiles(fileList);

      if (errors.length > 0) {
        alert(errors.join("\n"));
      }

      if (valid.length > 0) {
        const updatedFiles = [...files, ...valid];
        setFiles(updatedFiles);
        onFilesSelected?.(updatedFiles);
      }
    },
    [files, onFilesSelected, validateFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
          id="photo-upload-input"
        />

        <motion.div
          animate={{ y: dragOver ? -5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {dragOver ? "📥" : "🖼️"}
          </div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 8,
              color: "var(--text-primary)",
            }}
          >
            {dragOver ? "Drop your photos!" : "Drag & drop photos here"}
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
            or click to browse files
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            JPG, PNG • Max {maxSizeMB}MB per file
          </p>
        </motion.div>
      </div>

      {/* File Preview List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {files.length} photo{files.length > 1 ? "s" : ""} selected
            </p>

            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(26, 26, 46, 0.6)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📷</span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-primary)",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: 4,
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
