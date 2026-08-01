import { Camera } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(15, 23, 42, 0.9)",
        padding: "32px 24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Camera size={18} style={{ color: "var(--purple-400)" }} />
          <span
            style={{ fontWeight: 600 }}
            className="gradient-text"
          >
            GrabPic
          </span>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Built with Next.js, AWS Lambda &amp; Face Recognition AI
        </p>

        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          © {new Date().getFullYear()} GrabPic. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
