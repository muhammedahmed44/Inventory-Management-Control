import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeType, setStoreType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !storeType) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        store_type: storeType,
      });

      alert("Registration successful! Please sign in.");
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div style={styles.root}>
      <div style={styles.grid} />
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />

      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>📦</div>
          <div>
            <div style={styles.logoTitle}>IMS</div>
            <div style={styles.logoSub}>Inventory Management System</div>
          </div>
        </div>

        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.subtext}>Register your shop to get started</p>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        {/* Full Name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Store Type */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Store Type</label>
          <div style={styles.storeTypeRow}>

            <div
              style={{
                ...styles.storeCard,
                ...(storeType === "online" ? styles.storeCardActive : {}),
              }}
              onClick={() => setStoreType("online")}
            >
              <div style={styles.storeIcon}>🌐</div>
              <div style={styles.storeTitle}>Online Store</div>
              <div style={styles.storeDesc}>Rider features enabled</div>
            </div>

            <div
              style={{
                ...styles.storeCard,
                ...(storeType === "offline" ? styles.storeCardActive : {}),
              }}
              onClick={() => setStoreType("offline")}
            >
              <div style={styles.storeIcon}>🏪</div>
              <div style={styles.storeTitle}>Offline Shop</div>
              <div style={styles.storeDesc}>No rider features</div>
            </div>

          </div>
        </div>

        {/* Store type info */}
        {storeType && (
          <div style={styles.infoBox}>
            {storeType === "online" ? (
              <>🚴 Rider management will be <span style={{ color: "#4ade80" }}>enabled</span></>
            ) : (
              <>🏪 Rider features will be <span style={{ color: "#f87171" }}>hidden</span> — local orders only</>
            )}
          </div>
        )}

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            ...styles.btnPrimary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 30px rgba(59,130,246,0.5)";
            }
          }}
          onMouseLeave={e => {
            e.target.style.background = "#3b82f6";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 20px rgba(59,130,246,0.35)";
          }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>already have an account?</span>
          <div style={styles.dividerLine} />
        </div>

        <p style={styles.loginText}>
          <span
            style={styles.loginLink}
            onClick={() => navigate("/login")}
            onMouseEnter={e => e.target.style.color = "#60a5fa"}
            onMouseLeave={e => e.target.style.color = "#3b82f6"}
          >
            Sign in instead
          </span>
        </p>

      </div>
    </div>
  );
}

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
    padding: "40px 16px",
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
    width: 350,
    height: 350,
    background: "rgba(59,130,246,0.1)",
    top: -80,
    left: -80,
  },
  blob2: {
    width: 280,
    height: 280,
    background: "rgba(99,102,241,0.08)",
    bottom: -60,
    right: -60,
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 440,
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  logoIcon: {
    fontSize: 32,
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 12,
    width: 52,
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoTitle: {
    color: "#f0f6ff",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "0.05em",
  },
  logoSub: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.03em",
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 26,
    fontWeight: 700,
    margin: "0 0 6px",
    letterSpacing: "-0.01em",
  },
  subtext: {
    color: "#64748b",
    fontSize: 14,
    margin: "0 0 24px",
    fontFamily: "'Courier New', monospace",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 18,
    fontFamily: "'Courier New', monospace",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    marginBottom: 7,
    letterSpacing: "0.03em",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#f0f6ff",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "'Courier New', monospace",
  },
  storeTypeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 4,
  },
  storeCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "16px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  storeCardActive: {
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.4)",
    boxShadow: "0 0 16px rgba(59,130,246,0.15)",
  },
  storeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  storeTitle: {
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
  },
  storeDesc: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
  },
  infoBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#64748b",
    fontFamily: "'Courier New', monospace",
    marginBottom: 18,
  },
  btnPrimary: {
    width: "100%",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    marginTop: 6,
    letterSpacing: "0.01em",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0 16px",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    whiteSpace: "nowrap",
  },
  loginText: {
    textAlign: "center",
    margin: 0,
  },
  loginLink: {
    color: "#3b82f6",
    cursor: "pointer",
    transition: "color 0.2s",
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};