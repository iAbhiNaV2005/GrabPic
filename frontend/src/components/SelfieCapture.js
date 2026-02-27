"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function SelfieCapture({ onCapture }) {
  const [mode, setMode] = useState("select"); // "select" | "camera" | "upload"
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = useCallback(async () => {
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      alert("Camera access denied. Please allow camera access or upload a photo instead.");
      setMode("select");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(base64);
    stopCamera();
    onCapture?.(base64);
  }, [onCapture, stopCamera]);

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        alert("Please upload a JPG or PNG image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be under 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setPreview(base64);
        setMode("upload");
        onCapture?.(base64);
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  const reset = () => {
    setPreview(null);
    setMode("select");
    stopCamera();
  };

  return (
    <div>
      {/* Mode selector */}
      {mode === "select" && !preview && (
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startCamera}
            className="glass-card"
            style={{
              padding: "32px 24px",
              cursor: "pointer",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-glass)",
              color: "var(--text-primary)",
              textAlign: "center",
              minWidth: 180,
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Take a Selfie</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Use your camera</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="glass-card"
            style={{
              padding: "32px 24px",
              cursor: "pointer",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-glass)",
              color: "var(--text-primary)",
              textAlign: "center",
              minWidth: 180,
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Upload Photo</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Choose from device</div>
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="selfie-upload-input"
          />
        </div>
      )}

      {/* Camera view */}
      {mode === "camera" && !preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              display: "inline-block",
              border: "2px solid var(--border-subtle)",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                display: "block",
                transform: "scaleX(-1)",
              }}
            />

            {/* Capture overlay */}
            {streaming && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 12,
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "white",
                    border: "4px solid rgba(124,58,237,0.5)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                  aria-label="Capture selfie"
                >
                  📸
                </motion.button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => {
                stopCamera();
                setMode("select");
              }}
              className="btn-secondary"
              style={{ padding: "8px 24px", fontSize: 14 }}
            >
              ← Back
            </button>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </motion.div>
      )}

      {/* Preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              display: "inline-block",
              border: "2px solid var(--purple-500)",
              boxShadow: "0 0 30px rgba(124,58,237,0.3)",
            }}
          >
            <img
              src={preview}
              alt="Your selfie"
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                display: "block",
              }}
            />
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              className="btn-secondary"
              style={{ padding: "8px 24px", fontSize: 14 }}
            >
              ↻ Retake
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--cyan-400)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              ✓ Selfie ready
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
