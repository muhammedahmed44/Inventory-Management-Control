import { useState, useEffect } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";

export default function Inventory() {

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("general");
  const [unitType, setUnitType] = useState("pcs");

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const formatted = res.data.data.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit_type: p.unit_type,
        stock: Number(p.stock_qty) || 0,
      }));
      setProducts(formatted);
    } catch (error) {
      console.log("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // SAVE PRODUCT
  const handleSave = async () => {
    if (name.trim() === "" || stock === "") return;

    const existing = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    try {
      if (existing) {
        await api.post("/restocks", {
          product_id: existing.id,
          quantity: Number(stock),
        });
        console.log("Stock updated");
      } else {
        await api.post("/products", {
          name: name,
          category: category,
          unit_type: unitType,
          stock_qty: Number(stock),
        });
        console.log("New product added");
      }

      setName("");
      setStock("");
      setCategory("general");
      setUnitType("pcs");
      fetchProducts();

    } catch (error) {
      console.log("Save error", error);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.log("Delete error", error);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStock = products.filter((p) => p.stock < 5).length;

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>📦 Inventory Management</h1>

        {/* ADD PRODUCT FORM */}
        <div style={styles.formCard}>
          <div style={styles.formRow}>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Stock Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}
              >
                <option value="general">General</option>
                <option value="food">Food</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="medicine">Medicine</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Unit Type</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                style={styles.input}
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kg</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={handleSave}
                style={styles.saveBtn}
                onMouseEnter={e => e.target.style.background = "#2563eb"}
                onMouseLeave={e => e.target.style.background = "#3b82f6"}
              >
                Save
              </button>
            </div>

          </div>
        </div>

        {/* STATS ROW */}
        <div style={styles.statsRow}>
          <div style={styles.statBadge}>
            📦 Total Products: <strong>{products.length}</strong>
          </div>
          <div style={{ ...styles.statBadge, ...styles.statRed }}>
            ⚠️ Low Stock: <strong>{lowStock}</strong>
          </div>
          <div style={{ ...styles.statBadge, ...styles.statGreen }}>
            ✅ Total Stock: <strong>{totalStock}</strong>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{
                    ...styles.tr,
                    background: product.stock < 5
                      ? "rgba(239,68,68,0.07)"
                      : "transparent",
                  }}
                >
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>{product.category || "—"}</td>
                  <td style={styles.td}>{product.unit_type || "—"}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.stockBadge,
                      background: product.stock <= 0
                        ? "rgba(239,68,68,0.15)"
                        : product.stock < 5
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(34,197,94,0.15)",
                      color: product.stock <= 0
                        ? "#f87171"
                        : product.stock < 5
                        ? "#fbbf24"
                        : "#4ade80",
                    }}>
                      {product.stock <= 0 ? "Out of Stock" : product.stock}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={styles.deleteBtn}
                      onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.2)"}
                      onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.1)"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={5} style={styles.emptyRow}>
                    No products found. Add your first product above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    maxWidth: 1100,
    margin: "0 auto",
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: "-0.01em",
  },
  formCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 20,
  },
  formRow: {
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
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginBottom: 6,
    letterSpacing: "0.03em",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "#f0f6ff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'Courier New', monospace",
  },
  saveBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
    height: 40,
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statBadge: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "8px 16px",
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  statRed: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5",
  },
  statGreen: {
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#86efac",
  },
  tableCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(255,255,255,0.05)",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  tr: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 16px",
    color: "#e2e8f0",
    fontSize: 14,
  },
  stockBadge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
  },
  deleteBtn: {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  emptyRow: {
    textAlign: "center",
    padding: "40px",
    color: "#334155",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};