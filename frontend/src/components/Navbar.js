"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Camera size={18} strokeWidth={2.5} />
          </div>
          <span className="navbar-logo-text gradient-text">GrabPic</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link href="/" className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Home
          </Link>
          <Link href="/create" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Create Album
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              padding: "0 var(--space-lg)",
            }}
          >
            <div style={{ padding: "var(--space-md) 0", display: "flex", flexDirection: "column", gap: 8 }}>
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
    </nav>
  );
}
