"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card"
      style={{
        padding: 32,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          margin: "0 auto 20px",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 12,
          fontFamily: "var(--font-space), sans-serif",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 15 }}>
        {description}
      </p>
    </motion.div>
  );
}
