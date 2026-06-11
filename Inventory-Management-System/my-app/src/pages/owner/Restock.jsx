import { useState, useEffect } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";

export default function Restock() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/restocks");
      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestock = async () => {
    if (!selectedProduct || !quantity) {
      alert("Please select a product and enter quantity");
      return;
    }

    setLoading(true);

    try {
      await api.post("/restocks", {
        product_id: selectedProduct,
        quantity: Number(quantity),
      });

      alert("✅ Stock updated successfully");
      setSelectedProduct("");
      setQuantity("");
      fetchProducts();
      fetchHistory();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Restock failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductData = products.find(
    (p) => String(p.id) === String(selectedProduct)
  );

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>🔄 Restock Products</h1>

        <div style={styles.mainGrid}>

          {/* LEFT — RESTOCK FORM */}
          <div>
            <div style={styles.card}>
              <div style={styles.sectionTitle}>Add Stock</div>

              {/* Select Product */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Select Product</label>
                <select
                  style={styles.input}
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — Stock: {product.stock_qty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected product info */}
              {selectedProductData && (
                <div style={styles.productInfo}>
                  <div style={styles.productInfoRow}>
                    <span style={styles.infoLabel}>Current Stock</span>
                    <span style={{
                      ...styles.infoValue,
                      color: selectedProductData.stock_qty < 5
                        ? "#f87171"
                        : "#4ade80",
                    }}>
                      {selectedProductData.stock_qty}
                    </span>
                  </div>
                  <div style={styles.productInfoRow}>
                    <span style={styles.infoLabel}>Category</span>
                    <span style={styles.infoValue}>
                      {selectedProductData.category || "—"}
                    </span>
                  </div>
                  <div style={styles.productInfoRow}>
                    <span style={styles.infoLabel}>Unit</span>
                    <span style={styles.infoValue}>
                      {selectedProductData.unit_type || "—"}
                    </span>
                  </div>
                  {quantity && (
                    <div style={styles.productInfoRow}>
                      <span style={styles.infoLabel}>After Restock</span>
                      <span style={{ ...styles.infoValue, color: "#3b82f6" }}>
                        {Number(selectedProductData.stock_qty) + Number(quantity)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Add Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity to add"
                  style={styles.input}
                  value={quantity}
                  min="1"
                  onChange={(e) => setQuantity(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRestock}
                disabled={loading}
                style={{
                  ...styles.restockBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => {
                  if (!loading) e.target.style.background = "#2563eb";
                }}
                onMouseLeave={e => e.target.style.background = "#3b82f6"}
              >
                {loading ? "Updating..." : "🔄 Restock Product"}
              </button>
            </div>
          </div>

          {/* RIGHT — LOW STOCK + HISTORY */}
          <div>

            {/* Low Stock Alert */}
            <div style={styles.sectionTitle}>⚠️ Low Stock Products</div>
            <div style={styles.card}>
              {products.filter((p) => p.stock_qty < 5).length === 0 ? (
                <div style={styles.emptyText}>
                  ✅ All products have sufficient stock
                </div>
              ) : (
                products
                  .filter((p) => p.stock_qty < 5)
                  .map((p) => (
                    <div key={p.id} style={styles.lowStockItem}>
                      <span style={styles.lowStockName}>{p.name}</span>
                      <span style={styles.lowStockBadge}>
                        {p.stock_qty <= 0 ? "Out of Stock" : `${p.stock_qty} left`}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Restock History */}
            {history.length > 0 && (
              <>
                <div style={{ ...styles.sectionTitle, marginTop: 20 }}>
                  📋 Restock History
                </div>
                <div style={styles.card}>
                  {history.slice(0, 6).map((h, i) => (
                    <div key={i} style={styles.historyItem}>
                      <div>
                        <div style={styles.historyName}>
                          {h.product_name || `Product #${h.product_id}`}
                        </div>
                        <div style={styles.historyDate}>
                          {new Date(h.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={styles.historyQty}>+{h.quantity}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

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
    maxWidth: 1000,
    margin: "0 auto",
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: "-0.01em",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    alignItems: "start",
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 4,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginBottom: 7,
    letterSpacing: "0.03em",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#f0f6ff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    fontFamily: "'Courier New', monospace",
  },
  productInfo: {
    background: "rgba(59,130,246,0.05)",
    border: "1px solid rgba(59,130,246,0.15)",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 18,
  },
  productInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  infoValue: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Courier New', monospace",
  },
  restockBtn: {
    width: "100%",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  emptyText: {
    color: "#4ade80",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    textAlign: "center",
    padding: "12px 0",
  },
  lowStockItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  lowStockName: {
    color: "#e2e8f0",
    fontSize: 14,
  },
  lowStockBadge: {
    background: "rgba(239,68,68,0.15)",
    color: "#f87171",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  historyName: {
    color: "#e2e8f0",
    fontSize: 13,
  },
  historyDate: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    marginTop: 2,
  },
  historyQty: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Courier New', monospace",
  },
};