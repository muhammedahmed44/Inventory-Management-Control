import { useState } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];

  const [dailyDate, setDailyDate] = useState(today);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState("");

  // HELPER — download blob as file
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // DOWNLOAD PRODUCTS CSV
  const downloadProductsCSV = async () => {
    setLoading("products");
    try {
      const res = await api.get("/reports/products/csv", {
        responseType: "blob",
      });
      downloadFile(res.data, "products.csv");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to download products CSV");
    } finally {
      setLoading("");
    }
  };

  // DOWNLOAD DAILY REPORT CSV
  const downloadDailyCSV = async () => {
    setLoading("daily");
    try {
      const res = await api.get(`/reports/daily/csv?date=${dailyDate}`, {
        responseType: "blob",
      });
      downloadFile(res.data, `report_${dailyDate}.csv`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to download daily report");
    } finally {
      setLoading("");
    }
  };

  // DOWNLOAD CUSTOM RANGE CSV
  const downloadCustomCSV = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }
    if (fromDate > toDate) {
      alert("From date cannot be after To date");
      return;
    }

    setLoading("custom");
    try {
      const res = await api.get(
        `/reports/custom/csv?from_date=${fromDate}&to_date=${toDate}`,
        { responseType: "blob" }
      );
      downloadFile(res.data, `report_${fromDate}_to_${toDate}.csv`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to download custom report");
    } finally {
      setLoading("");
    }
  };

  // DOWNLOAD PDF REPORT
  const downloadPDF = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }

    setLoading("pdf");
    try {
      const res = await api.get(
        `/analytics/report/pdf?start=${fromDate}&end=${toDate}`,
        { responseType: "blob" }
      );
      downloadFile(res.data, `IMS_Report_${fromDate}_to_${toDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to download PDF report");
    } finally {
      setLoading("");
    }
  };

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>📋 Reports</h1>
        <p style={styles.subtext}>Download reports in CSV or PDF format</p>

        {/* SECTION 1 — PRODUCTS REPORT */}
        <div style={styles.reportCard}>
          <div style={styles.cardLeft}>
            <div style={styles.cardIcon}>📦</div>
            <div>
              <div style={styles.cardTitle}>Products Report</div>
              <div style={styles.cardDesc}>
                Export full inventory list with stock levels, categories and unit types.
              </div>
              <div style={styles.cardBadge}>CSV</div>
            </div>
          </div>
          <button
            onClick={downloadProductsCSV}
            disabled={loading === "products"}
            style={{
              ...styles.downloadBtn,
              ...styles.csvBtn,
              opacity: loading === "products" ? 0.7 : 1,
              cursor: loading === "products" ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (loading !== "products") e.target.style.background = "rgba(34,197,94,0.2)"; }}
            onMouseLeave={e => e.target.style.background = "rgba(34,197,94,0.1)"}
          >
            {loading === "products" ? "Downloading..." : "⬇ Download CSV"}
          </button>
        </div>

        {/* SECTION 2 — DAILY REPORT */}
        <div style={styles.reportCard}>
          <div style={styles.cardLeft}>
            <div style={styles.cardIcon}>📅</div>
            <div>
              <div style={styles.cardTitle}>Daily Orders Report</div>
              <div style={styles.cardDesc}>
                Export all orders for a specific date with status and totals.
              </div>
              <div style={styles.dateRow}>
                <label style={styles.label}>Select Date</label>
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.cardBadge}>CSV</div>
            </div>
          </div>
          <button
            onClick={downloadDailyCSV}
            disabled={loading === "daily"}
            style={{
              ...styles.downloadBtn,
              ...styles.csvBtn,
              opacity: loading === "daily" ? 0.7 : 1,
              cursor: loading === "daily" ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (loading !== "daily") e.target.style.background = "rgba(34,197,94,0.2)"; }}
            onMouseLeave={e => e.target.style.background = "rgba(34,197,94,0.1)"}
          >
            {loading === "daily" ? "Downloading..." : "⬇ Download CSV"}
          </button>
        </div>

        {/* SECTION 3 — CUSTOM RANGE */}
        <div style={styles.reportCard}>
          <div style={styles.cardLeft}>
            <div style={styles.cardIcon}>📊</div>
            <div>
              <div style={styles.cardTitle}>Custom Range Report</div>
              <div style={styles.cardDesc}>
                Export orders between any two dates. Available in CSV and PDF.
              </div>
              <div style={styles.dateRow}>
                <div style={styles.dateGroup}>
                  <label style={styles.label}>From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.dateGroup}>
                  <label style={styles.label}>To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div style={styles.cardBadge}>CSV</div>
                <div style={{ ...styles.cardBadge, ...styles.pdfBadge }}>PDF</div>
              </div>
            </div>
          </div>

          <div style={styles.btnGroup}>
            <button
              onClick={downloadCustomCSV}
              disabled={loading === "custom"}
              style={{
                ...styles.downloadBtn,
                ...styles.csvBtn,
                opacity: loading === "custom" ? 0.7 : 1,
                cursor: loading === "custom" ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (loading !== "custom") e.target.style.background = "rgba(34,197,94,0.2)"; }}
              onMouseLeave={e => e.target.style.background = "rgba(34,197,94,0.1)"}
            >
              {loading === "custom" ? "Downloading..." : "⬇ CSV"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={loading === "pdf"}
              style={{
                ...styles.downloadBtn,
                ...styles.pdfBtn,
                opacity: loading === "pdf" ? 0.7 : 1,
                cursor: loading === "pdf" ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (loading !== "pdf") e.target.style.background = "rgba(167,139,250,0.2)"; }}
              onMouseLeave={e => e.target.style.background = "rgba(167,139,250,0.1)"}
            >
              {loading === "pdf" ? "Downloading..." : "⬇ PDF"}
            </button>
          </div>
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
  container: {
    padding: "24px",
    maxWidth: 900,
    margin: "0 auto",
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 6px",
    letterSpacing: "-0.01em",
  },
  subtext: {
    color: "#475569",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    margin: "0 0 28px",
  },
  reportCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "24px",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  cardLeft: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    flex: 1,
  },
  cardIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  cardTitle: {
    color: "#f0f6ff",
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
  },
  cardDesc: {
    color: "#64748b",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    lineHeight: 1.6,
    marginBottom: 10,
    maxWidth: 420,
  },
  cardBadge: {
    display: "inline-block",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#4ade80",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  pdfBadge: {
    background: "rgba(167,139,250,0.1)",
    border: "1px solid rgba(167,139,250,0.2)",
    color: "#c4b5fd",
  },
  dateRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  dateGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    marginBottom: 5,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "7px 10px",
    color: "#f0f6ff",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Courier New', monospace",
  },
  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  downloadBtn: {
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  csvBtn: {
    background: "rgba(34,197,94,0.1)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  pdfBtn: {
    background: "rgba(167,139,250,0.1)",
    color: "#c4b5fd",
    border: "1px solid rgba(167,139,250,0.2)",
  },
};