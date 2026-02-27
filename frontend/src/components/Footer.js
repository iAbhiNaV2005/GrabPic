export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(124, 58, 237, 0.1)",
        background: "rgba(10, 10, 15, 0.9)",
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
          <span style={{ fontSize: 18 }}>📸</span>
          <span
            style={{
              fontWeight: 600,
              fontFamily: "var(--font-space), sans-serif",
            }}
            className="gradient-text"
          >
            GrabPic
          </span>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Built with Next.js, AWS Lambda & Face Recognition AI
        </p>

        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          © {new Date().getFullYear()} GrabPic. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
