"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card"
      style={{ padding: "28px 24px" }}
    >
      <div className="page-icon" style={{ margin: "0 0 16px 0", width: 48, height: 48, borderRadius: 12 }}>
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 14 }}>
        {description}
      </p>
    </motion.div>
  );
}
