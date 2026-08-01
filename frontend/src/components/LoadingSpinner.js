"use client";

export default function LoadingSpinner({ text = "Processing..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{text}</p>
    </div>
  );
}
