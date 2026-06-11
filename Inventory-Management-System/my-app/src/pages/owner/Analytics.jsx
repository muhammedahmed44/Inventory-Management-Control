import { useState, useEffect } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

export default function Analytics() {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSummary(),
        fetchRevenue(),
        fetchTopProducts(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // GET /api/analytics/summary?date=
  const fetchSummary = async () => {
    try {
      const res = await api.get(`/analytics/summary?date=${date}`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Summary error", err);
    }
  };

  // GET /api/analytics/revenue?start=&end=
  const fetchRevenue = async () => {
    try {
      const res = await api.get(`/analytics/revenue?start=${start}&end=${end}`);
      setRevenue(res.data);
    } catch (err) {
      console.error("Revenue error", err);
    }
  };

  // GET /api/analytics/top-products?start=&end=
  const fetchTopProducts = async () => {
    try {
      const res = await api.get(`/analytics/top-products?start=${start}&end=${end}`);
      setTopProducts(res.data.top_products || []);
    } catch (err) {
      console.error("Top products error", err);
    }
  };

  const handleFilter = () => {
    fetchAll();
  };

  // Download PDF report
  const downloadPDF = async () => {
    try {
      const res = await api.get(
        `/analytics/report/pdf?start=${start}&end=${end}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IMS_Report_${start}_to_${end}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF error", err);
      alert("Failed to download PDF");
    }
  };

  const DONUT_COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

  const donutData = summary
    ? [
        { name: "Completed", value: summary.completed_orders },
        { name: "Cancelled", value: summary.cancelled_orders },
        { name: "Pending", value: summary.pending_orders },
      ].filter((d) => d.value > 0)
    : [];

  const statCards = summary
    ? [
        {
          label: "Total Orders",
          value: summary.total_orders,
          icon: "🧾",
          color: "#3b82f6",
          bg: "rgba(59,130,246,0.1)",
          border: "rgba(59,130,246,0.25)",
        },
        {
          label: "Completed",
          value: summary.completed_orders,
          icon: "✅",
          color: "#22c55e",
          bg: "rgba(34,197,94,0.1)",
          border: "rgba(34,197,94,0.25)",
        },
        {
          label: "Cancelled",
          value: summary.cancelled_orders,
          icon: "❌",
          color: "#ef4444",
          bg: "rgba(239,68,68,0.1)",
          border: "rgba(239,68,68,0.25)",
        },
        {
          label: "Pending",
          value: summary.pending_orders,
          icon: "⏳",
          color: "#f59e0b",
          bg: "rgba(245,158,11,0.1)",
          border: "rgba(245,158,11,0.25)",
        },
        {
          label: "Total Revenue",
          value: summary.total_revenue,
          icon: "💰",
          color: "#a78bfa",
          bg: "rgba(167,139,250,0.1)",
          border: "rgba(167,139,250,0.25)",
        },
      ]
    : [];

  if (loading) {
    return (
      <div style={styles.root}>
        <OwnerNavbar />
        <div style={styles.loadingWrap}>
          <div style={styles.loadingText}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>📊 Analytics Dashboard</h1>
            <p style={styles.subtext}>Track your store performance</p>
          </div>
          <button
            onClick={downloadPDF}
            style={styles.pdfBtn}
            onMouseEnter={e => e.target.style.background = "rgba(167,139,250,0.2)"}
            onMouseLeave={e => e.target.style.background = "rgba(167,139,250,0.1)"}
          >
            📄 Download PDF Report
          </button>
        </div>

        {/* DATE FILTERS */}
        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Summary Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Revenue From</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Revenue To</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={handleFilter}
                style={styles.filterBtn}
                onMouseEnter={e => e.target.style.background = "#2563eb"}
                onMouseLeave={e => e.target.style.background = "#3b82f6"}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={styles.cardGrid}>
          {statCards.map((card, i) => (
            <div
              key={i}
              style={{
                ...styles.statCard,
                background: card.bg,
                border: `1px solid ${card.border}`,
              }}
            >
              <div style={styles.statIcon}>{card.icon}</div>
              <div style={{ ...styles.statValue, color: card.color }}>
                {card.value}
              </div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* REVENUE SUMMARY */}
        {revenue && (
          <div style={styles.revenueRow}>
            <div style={styles.revenueCard}>
              <div style={styles.revenueLabel}>Total Revenue</div>
              <div style={styles.revenueValue}>{revenue.summary?.total_revenue}</div>
            </div>
            <div style={styles.revenueCard}>
              <div style={styles.revenueLabel}>Total Orders</div>
              <div style={styles.revenueValue}>{revenue.summary?.total_orders}</div>
            </div>
            <div style={styles.revenueCard}>
              <div style={styles.revenueLabel}>Avg Order Value</div>
              <div style={styles.revenueValue}>{revenue.summary?.avg_order_value}</div>
            </div>
          </div>
        )}

        {/* CHARTS ROW */}
        <div style={styles.chartsRow}>

          {/* LINE CHART — Daily Revenue */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>📅 Daily Revenue Trend</h2>
            {revenue?.daily?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenue.daily}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#f0f6ff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.noData}>No revenue data for this period</div>
            )}
          </div>

          {/* DONUT CHART — Order Breakdown */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>🎯 Order Breakdown</h2>
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#f0f6ff",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.noData}>No order data for this date</div>
            )}
          </div>

        </div>

        {/* TOP PRODUCTS BAR CHART */}
        <div style={{ ...styles.chartCard, marginTop: 20 }}>
          <h2 style={styles.chartTitle}>🏆 Top Products by Units Sold</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#f0f6ff",
                  }}
                />
                <Bar dataKey="total_sold" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Units Sold" />
                <Bar dataKey="total_revenue" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.noData}>No product data for this period</div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080e1a",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  },
  loadingText: {
    color: "#475569",
    fontSize: 16,
    fontFamily: "'Courier New', monospace",
  },
  container: {
    padding: "24px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 4px",
    letterSpacing: "-0.01em",
  },
  subtext: {
    color: "#475569",
    fontSize: 13,
    margin: 0,
    fontFamily: "'Courier New', monospace",
  },
  pdfBtn: {
    background: "rgba(167,139,250,0.1)",
    border: "1px solid rgba(167,139,250,0.25)",
    color: "#c4b5fd",
    borderRadius: 10,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    transition: "background 0.2s",
  },
  filterCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 24,
  },
  filterRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 140,
  },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    marginBottom: 6,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#f0f6ff",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Courier New', monospace",
  },
  filterBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    borderRadius: 14,
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statIcon: { fontSize: 22, marginBottom: 2 },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  revenueRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 20,
  },
  revenueCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "14px 18px",
    textAlign: "center",
  },
  revenueLabel: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  revenueValue: {
    color: "#f0f6ff",
    fontSize: 20,
    fontWeight: 700,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  chartCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "20px",
  },
  chartTitle: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: 600,
    margin: "0 0 16px",
  },
  noData: {
    color: "#334155",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    textAlign: "center",
    padding: "60px 0",
  },
};