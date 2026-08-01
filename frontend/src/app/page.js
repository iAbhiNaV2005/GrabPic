"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import { FolderPlus, Link2, ScanFace, Zap, Server, Database, Cloud, Brain, Globe, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* ============================================
          Hero Section (Split Layout)
          ============================================ */}
      <section
        style={{
          position: "relative",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "96px 24px 80px", // max pt-24 (96px)
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 48,
              alignItems: "center",
            }}
          >
            {/* Left Col: Text */}
            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Note: NO eyebrow, to follow eyebrow restraint rule */}
              
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(48px, 6vw, 72px)",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  marginBottom: 24,
                }}
              >
                Find Yourself <br />
                in Group Photos
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(16px, 2vw, 18px)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  maxWidth: 480,
                  marginBottom: 40,
                }}
              >
                Upload trip photos. Share one link. Let AI instantly find every photo your friends appear in.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
              >
                <Link href="/create" className="btn-primary" style={{ padding: "16px 32px" }}>
                  Create Album
                </Link>
                <a href="#how-it-works" className="btn-secondary" style={{ padding: "16px 32px" }}>
                  How It Works
                </a>
              </motion.div>
            </div>

            {/* Right Col: Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative" }}
            >
              <div 
                className="glass-card" 
                style={{ 
                  padding: 8, 
                  borderRadius: "var(--radius-xl)",
                  boxShadow: "0 24px 60px rgba(124, 58, 237, 0.15)"
                }}
              >
                <img
                  src="/hero-image.png"
                  alt="Friends laughing together at night"
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    borderRadius: "calc(var(--radius-xl) - 8px)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          How It Works (Bento Layout, Left-aligned header)
          ============================================ */}
      <section id="how-it-works" style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Left-aligned header */}
          <div style={{ marginBottom: 64, maxWidth: 600 }}>
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              Three simple steps
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.6 }}>
              No accounts required. Just upload, share, and find your photos.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <FeatureCard
              icon={FolderPlus}
              title="Create an Album"
              description="Give your album a name and upload all your group trip photos. We'll process each photo and detect all faces using AI."
              delay={0}
            />
            <FeatureCard
              icon={Link2}
              title="Share the Link"
              description="Get a unique shareable link for your album. Send it to friends, family, or anyone who was part of the trip."
              delay={0.05}
            />
            <FeatureCard
              icon={ScanFace}
              title="Upload a Selfie"
              description="Visitors upload a selfie or take one with their camera. Our AI instantly finds all photos they appear in."
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ============================================
          Architecture (Asymmetric Layout)
          ============================================ */}
      <section style={{ padding: "120px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Left: Copy */}
            <div>
              <span
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--cyan-400)",
                  fontWeight: 600,
                  marginBottom: 16,
                  display: "block"
                }}
              >
                The Engine
              </span>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 24,
                  lineHeight: 1.1,
                }}
              >
                Serverless scale. <br />
                Instant processing.
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 18, lineHeight: 1.6, marginBottom: 32 }}>
                Built natively on AWS with zero server management. 
                Our architecture scales automatically to handle thousands of photos, extracting and matching facial vectors in milliseconds.
              </p>
            </div>

            {/* Right: Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                { name: "Next.js", icon: Globe, desc: "Frontend" },
                { name: "AWS Lambda", icon: Zap, desc: "Compute" },
                { name: "DynamoDB", icon: Database, desc: "Storage" },
                { name: "S3", icon: Cloud, desc: "Media" },
                { name: "Vector Search", icon: Brain, desc: "AI Engine" },
                { name: "API Gateway", icon: Server, desc: "Routing" },
              ].map((tech, i) => (
                <div
                  key={tech.name}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    transform: i % 2 !== 0 ? "translateY(24px)" : "none",
                  }}
                >
                  <tech.icon size={24} style={{ color: "var(--purple-400)" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{tech.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{tech.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA Section
          ============================================ */}
      <section style={{ padding: "80px 24px 120px" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "clamp(32px, 4vw, 40px)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Ready to find yourself?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 18,
              marginBottom: 40,
              maxWidth: 400,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Create your first album and start sharing with friends in under a minute.
          </p>
          <Link href="/create" className="btn-primary" style={{ padding: "16px 40px" }}>
            Get Started
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
