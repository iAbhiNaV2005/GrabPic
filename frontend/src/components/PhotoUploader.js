"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImagePlus, FileImage, X, AlertCircle } from "lucide-react";

export default function PhotoUploader({ onFilesSelected, maxSizeMB = 10 }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const maxSize = maxSizeMB * 1024 * 1024;
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  const validateFiles = useCallback(
    (fileList) => {
      const valid = [];
      const errs = [];

      Array.from(fileList).forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          errs.push(`${file.name}: Invalid type. Only JPG/PNG allowed.`);
        } else if (file.size > maxSize) {
          errs.push(`${file.name}: Exceeds ${maxSizeMB}MB limit.`);
        } else {
          valid.push(file);
        }
      });

      return { valid, errors: errs };
    },
    [maxSize, maxSizeMB]
  );

  const handleFiles = useCallback(
    (fileList) => {
      const { valid, errors: errs } = validateFiles(fileList);
      setErrors(errs);

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
      {/* Inline errors (replaces alert()) */}
      {errors.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {errors.map((err, i) => (
            <div key={i} className="inline-error">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {err}
            </div>
          ))}
        </div>
      )}

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

        <div style={{ transition: "transform 200ms ease", transform: dragOver ? "translateY(-4px)" : "none" }}>
          <div style={{ marginBottom: 14, color: dragOver ? "var(--purple-400)" : "var(--text-muted)" }}>
            {dragOver ? <Upload size={40} /> : <ImagePlus size={40} />}
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
            {dragOver ? "Drop your photos!" : "Drag & drop photos here"}
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 14 }}>
            or click to browse files
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            JPG, PNG · Max {maxSizeMB}MB per file
          </p>
        </div>
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
            <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>
              {files.length} photo{files.length > 1 ? "s" : ""} selected
            </p>

            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: index * 0.03 }}
                className="file-item"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileImage size={16} style={{ color: "var(--purple-400)", flexShrink: 0 }} />
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
                  className="file-item-remove"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
