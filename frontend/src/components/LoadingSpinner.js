"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner({ text = "Processing..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: 48,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "3px solid var(--bg-tertiary)",
          borderTopColor: "var(--purple-500)",
          borderRightColor: "var(--cyan-500)",
        }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{text}</p>
    </div>
  );
}
