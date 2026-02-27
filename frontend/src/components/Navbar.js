"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(10, 10, 15, 0.8)",
        borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 72,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            📸
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--font-space), sans-serif",
            }}
            className="gradient-text"
          >
            GrabPic
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          className="desktop-nav"
        >
          <Link href="/" className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Home
          </Link>
          <Link href="/create" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Create Album
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 24,
            cursor: "pointer",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--border-subtle)",
              padding: "0 24px",
            }}
            className="mobile-menu"
          >
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/"
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/create"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => setMobileOpen(false)}
              >
                Create Album
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
