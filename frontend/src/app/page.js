"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";

export default function HomePage() {
  return (
    <div>
      {/* ============================================
          Hero Section
          ============================================ */}
      <section
        style={{
          position: "relative",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "80px 24px",
        }}
      >
        {/* Floating decorative orbs */}
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="animate-float-delayed"
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "absolute",
            top: "50%",
            right: "25%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 800 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 18px",
                borderRadius: 100,
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "var(--purple-400)",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 28,
              }}
            >
              AI-Powered Face Recognition
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              fontFamily: "var(--font-space), sans-serif",
            }}
          >
            Find{" "}
            <span className="gradient-text">Yourself</span>
            <br />
            in Group Photos
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 600,
              margin: "0 auto 40px",
            }}
          >
            Upload group trip photos, share a link with friends, and let AI
            instantly find every photo they appear in.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/create" className="btn-primary" style={{ padding: "16px 40px", fontSize: 17 }}>
              Create Album
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ padding: "16px 40px", fontSize: 17 }}>
              How It Works
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: 64,
              display: "flex",
              justifyContent: "center",
              gap: 48,
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "Near-Zero", label: "Monthly Cost" },
              { value: "100%", label: "Serverless" },
              { value: "<1s", label: "Face Matching" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  className="gradient-text"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: "var(--font-space), sans-serif",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          How It Works
          ============================================ */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                marginBottom: 16,
                fontFamily: "var(--font-space), sans-serif",
              }}
            >
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 550, margin: "0 auto" }}>
              Three simple steps to find yourself in any group photo collection
            </p>
          </motion.div>

          {/* Steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <FeatureCard
              icon="📁"
              title="1. Create an Album"
              description="Give your album a name and upload all your group trip photos. We'll process each photo and detect all faces using AI."
              delay={0}
            />
            <FeatureCard
              icon="🔗"
              title="2. Share the Link"
              description="Get a unique shareable link for your album. Send it to friends, family, or anyone who was part of the trip."
              delay={0.1}
            />
            <FeatureCard
              icon="🤳"
              title="3. Upload a Selfie"
              description="Visitors upload a selfie or take one with their camera. Our AI instantly finds all photos they appear in."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ============================================
          Tech Stack
          ============================================ */}
      <section
        style={{
          padding: "80px 24px",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                marginBottom: 16,
                fontFamily: "var(--font-space), sans-serif",
              }}
            >
              Built with <span className="gradient-text-accent">Modern Tech</span>
            </h2>
          </motion.div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {[
              { name: "Next.js", icon: "⚡" },
              { name: "AWS Lambda", icon: "λ" },
              { name: "DynamoDB", icon: "🗄️" },
              { name: "S3", icon: "☁️" },
              { name: "Face AI", icon: "🧠" },
              { name: "Tailwind", icon: "🎨" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: "12px 24px",
                  background: "var(--bg-glass)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "default",
                }}
              >
                <span style={{ fontSize: 18 }}>{tech.icon}</span>
                {tech.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA Section
          ============================================ */}
      <section style={{ padding: "80px 24px 120px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "56px 40px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))",
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginBottom: 16,
              fontFamily: "var(--font-space), sans-serif",
            }}
          >
            Ready to find yourself?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 17,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Create your first album and start sharing with friends in under a minute.
          </p>
          <Link href="/create" className="btn-primary" style={{ padding: "16px 48px", fontSize: 17 }}>
            Get Started — It&apos;s Free
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
