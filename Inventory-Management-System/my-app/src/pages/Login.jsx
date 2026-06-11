import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  // "owner" logs in with email, "rider" logs in with username
  const [userType, setUserType] = useState("owner");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (userType === "owner" && (!email || !password)) {
      setError("Please enter your email and password");
      return;
    }
    if (userType === "rider" && (!username || !password)) {
      setError("Please enter your username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload =
        userType === "owner"
          ? { email, password }
          : { username, password };

      const res = await axios.post("http://localhost:5000/api/auth/login", payload);

      const { token, user } = res.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("store_type", user.store_type || "");
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "owner") {
        navigate("/owner/inventory");
      } else if (user.role === "rider") {
        navigate("/rider/dashboard");
      }

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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

        <h2 style={styles.heading}>Welcome Back</h2>
        <p style={styles.subtext}>Sign in to your account to continue</p>

        {/* User Type Toggle */}
        <div style={styles.toggleRow}>
          <div
            style={{
              ...styles.toggleBtn,
              ...(userType === "owner" ? styles.toggleActive : {}),
            }}
            onClick={() => { setUserType("owner"); setError(""); }}
          >
            🏪 Owner
          </div>
          <div
            style={{
              ...styles.toggleBtn,
              ...(userType === "rider" ? styles.toggleActive : {}),
            }}
            onClick={() => { setUserType("rider"); setError(""); }}
          >
            🚴 Rider
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>⚠️ {error}</div>
        )}

        {/* Email (Owner) or Username (Rider) */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            {userType === "owner" ? "Email" : "Username"}
          </label>
          {userType === "owner" ? (
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
          ) : (
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          )}
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
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
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Register link — only for owners */}
        {userType === "owner" && (
          <p style={styles.registerText}>
            New shop owner?{" "}
            <span
              style={styles.registerLink}
              onClick={() => navigate("/register")}
              onMouseEnter={e => e.target.style.color = "#60a5fa"}
              onMouseLeave={e => e.target.style.color = "#3b82f6"}
            >
              Register here
            </span>
          </p>
        )}

        {/* Rider hint */}
        {userType === "rider" && (
          <p style={styles.hintText}>
            🔑 Your credentials were provided by your shop owner
          </p>
        )}

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
    top: -100,
    right: -80,
  },
  blob2: {
    width: 280,
    height: 280,
    background: "rgba(99,102,241,0.08)",
    bottom: -60,
    left: -60,
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
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
    margin: "0 0 20px",
    fontFamily: "'Courier New', monospace",
  },
  toggleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 22,
  },
  toggleBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "10px",
    textAlign: "center",
    cursor: "pointer",
    color: "#475569",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.4)",
    color: "#93c5fd",
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
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  registerText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    margin: 0,
  },
  registerLink: {
    color: "#3b82f6",
    cursor: "pointer",
    transition: "color 0.2s",
    fontWeight: 600,
  },
  hintText: {
    textAlign: "center",
    color: "#475569",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    margin: 0,
  },
};