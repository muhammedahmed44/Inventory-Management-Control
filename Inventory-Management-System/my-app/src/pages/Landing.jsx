import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Floating accent blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Inventory Management System
        </div>

        {/* Hero */}
        <h1 style={styles.heading}>
          Manage Stock.<br />
          <span style={styles.headingAccent}>Ship Faster.</span>
        </h1>

        <p style={styles.subtext}>
          A complete solution for shop owners to track inventory,
          process orders, and manage riders — all in one place.
        </p>

        {/* CTA Buttons */}
        <div style={styles.buttonRow}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/register")}
            onMouseEnter={e => {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 30px rgba(59,130,246,0.5)";
            }}
            onMouseLeave={e => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 20px rgba(59,130,246,0.35)";
            }}
          >
            Register as Owner
          </button>

          <button
            style={styles.btnSecondary}
            onClick={() => navigate("/login")}
            onMouseEnter={e => {
              e.target.style.background = "rgba(255,255,255,0.12)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.borderColor = "#3b82f6";
            }}
            onMouseLeave={e => {
              e.target.style.background = "rgba(255,255,255,0.06)";
              e.target.style.transform = "translateY(0)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            Sign In
          </button>
        </div>

        {/* Feature Cards */}
        <div style={styles.cardRow}>
          {features.map((f, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardIcon}>{f.icon}</div>
              <div style={styles.cardTitle}>{f.title}</div>
              <div style={styles.cardDesc}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={styles.footer}>
          Owners register once · Riders receive auto-generated credentials
        </p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: "📦",
    title: "Inventory Tracking",
    desc: "Monitor stock levels in real-time with low stock alerts.",
  },
  {
    icon: "🧾",
    title: "Order Processing",
    desc: "Create and complete orders with automatic stock deduction.",
  },
  {
    icon: "🚴",
    title: "Rider Management",
    desc: "Add riders, assign orders and track deliveries easily.",
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "View sales trends, order stats and performance reports.",
  },
];

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080e1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    zIndex: 0,
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    zIndex: 0,
    pointerEvents: "none",
  },
  blob1: {
    width: 400,
    height: 400,
    background: "rgba(59,130,246,0.12)",
    top: -100,
    left: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    background: "rgba(99,102,241,0.1)",
    bottom: -80,
    right: -60,
  },
  container: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: "60px 24px",
    maxWidth: 780,
    width: "100%",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.3)",
    color: "#93c5fd",
    borderRadius: 999,
    padding: "6px 16px",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    marginBottom: 32,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3b82f6",
    display: "inline-block",
    boxShadow: "0 0 6px #3b82f6",
  },
  heading: {
    fontSize: "clamp(38px, 6vw, 68px)",
    fontWeight: 700,
    color: "#f0f6ff",
    lineHeight: 1.15,
    margin: "0 0 20px",
    letterSpacing: "-0.02em",
  },
  headingAccent: {
    color: "#3b82f6",
    fontStyle: "italic",
  },
  subtext: {
    fontSize: 17,
    color: "#94a3b8",
    lineHeight: 1.7,
    maxWidth: 520,
    margin: "0 auto 40px",
    fontFamily: "'Courier New', monospace",
    fontWeight: 400,
  },
  buttonRow: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 60,
  },
  btnPrimary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.06)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 40,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "22px 18px",
    textAlign: "left",
    backdropFilter: "blur(8px)",
  },
  cardIcon: {
    fontSize: 26,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 6,
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: "'Courier New', monospace",
  },
  footer: {
    color: "#334155",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.03em",
  },
};