import { useState, useEffect } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";

export default function Orders() {
  const [products, setProducts] = useState([]);
  const [qty, setQty] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const formatted = res.data.data.map((p) => ({
        ...p,
        stock: Number(p.stock_qty) || 0,
      }));
      setProducts(formatted);
    } catch (error) {
      console.log("Error fetching products", error);
    }
  };

  // FETCH COMPLETED ORDERS
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const orders = res.data.orders || [];
      setCompletedOrders(orders.filter((o) => o.status === "completed").slice(0, 5));
    } catch (error) {
      console.log("Error fetching orders", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // ADD ITEM TO ORDER
  const addOrder = (product) => {
    const quantity = Number(qty[product.id]);

    if (!quantity || quantity <= 0) {
      alert("Enter a valid quantity");
      return;
    }
    if (quantity > product.stock) {
      alert("Quantity exceeds available stock");
      return;
    }

    // Check if already in order
    const existing = orderItems.find((i) => i.id === product.id);
    if (existing) {
      setOrderItems(orderItems.map((i) =>
        i.id === product.id ? { ...i, qty: i.qty + quantity } : i
      ));
    } else {
      setOrderItems([...orderItems, { ...product, qty: quantity }]);
    }

    // Update local stock display
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - quantity } : p
      )
    );

    setQty({ ...qty, [product.id]: "" });
  };

  // REMOVE ITEM FROM ORDER
  const removeItem = (item) => {
    setOrderItems(orderItems.filter((i) => i.id !== item.id));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, stock: p.stock + item.qty } : p
      )
    );
  };

  // COMPLETE ORDER — POST to /api/orders then PUT to complete
  const completeOrder = async () => {
    if (orderItems.length === 0) {
      alert("No items in order");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const storeType = localStorage.getItem("store_type") || "offline";

      const createRes = await api.post("/orders", {
        items: orderItems.map((i) => ({
          product_id: i.id,
          quantity: i.qty,
        })),
        store_type: storeType,
      });

      const orderId = createRes.data.order.id;

      // Step 2: Complete order (deducts stock on backend)
      await api.put(`/orders/${orderId}/complete`);

      alert("✅ Order completed successfully!");
      setOrderItems([]);
      fetchProducts();
      fetchOrders();

    } catch (error) {
      console.log("Order error", error);
      alert(error.response?.data?.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalItems = orderItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>🧾 Order Processing</h1>

        <div style={styles.mainGrid}>

          {/* LEFT — PRODUCT TABLE */}
          <div style={styles.leftPanel}>
            <div style={styles.sectionTitle}>Select Products</div>

            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{
                      ...styles.tr,
                      opacity: product.stock === 0 ? 0.4 : 1,
                    }}>
                      <td style={styles.td}>{product.name}</td>
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
                          {product.stock <= 0 ? "Out" : product.stock}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={qty[product.id] || ""}
                          onChange={(e) =>
                            setQty({ ...qty, [product.id]: e.target.value })
                          }
                          disabled={product.stock === 0}
                          style={styles.qtyInput}
                        />
                      </td>
                      <td style={styles.td}>
                        <button
                          disabled={product.stock === 0}
                          onClick={() => addOrder(product)}
                          style={{
                            ...styles.addBtn,
                            opacity: product.stock === 0 ? 0.4 : 1,
                            cursor: product.stock === 0 ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={e => {
                            if (product.stock > 0) e.target.style.background = "#2563eb";
                          }}
                          onMouseLeave={e => e.target.style.background = "#3b82f6"}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} style={styles.emptyRow}>
                        No products available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div style={styles.rightPanel}>
            <div style={styles.sectionTitle}>Order Summary</div>

            <div style={styles.summaryCard}>

              {orderItems.length === 0 ? (
                <div style={styles.emptyOrder}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <div>No items added yet</div>
                </div>
              ) : (
                <>
                  {orderItems.map((item, index) => (
                    <div key={index} style={styles.orderItem}>
                      <div>
                        <div style={styles.orderItemName}>{item.name}</div>
                        <div style={styles.orderItemQty}>Qty: {item.qty}</div>
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        style={styles.removeBtn}
                        onMouseEnter={e => e.target.style.color = "#f87171"}
                        onMouseLeave={e => e.target.style.color = "#64748b"}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total Items</span>
                    <span style={styles.totalValue}>{totalItems}</span>
                  </div>
                </>
              )}

              <button
                onClick={completeOrder}
                disabled={loading || orderItems.length === 0}
                style={{
                  ...styles.completeBtn,
                  opacity: loading || orderItems.length === 0 ? 0.5 : 1,
                  cursor: loading || orderItems.length === 0 ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => {
                  if (!loading && orderItems.length > 0)
                    e.target.style.background = "#16a34a";
                }}
                onMouseLeave={e => e.target.style.background = "#22c55e"}
              >
                {loading ? "Processing..." : "✅ Complete Order"}
              </button>

            </div>

            {/* RECENT COMPLETED ORDERS */}
            {completedOrders.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={styles.sectionTitle}>Recent Orders</div>
                <div style={styles.recentCard}>
                  {completedOrders.map((order, i) => (
                    <div key={i} style={styles.recentItem}>
                      <span style={styles.recentId}>#{order.id}</span>
                      <span style={styles.recentStatus}>✅ Completed</span>
                      <span style={styles.recentDate}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    alignItems: "start",
  },
  leftPanel: {},
  rightPanel: {},
  sectionTitle: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
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
  qtyInput: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "6px 8px",
    color: "#f0f6ff",
    fontSize: 13,
    outline: "none",
    width: 70,
    fontFamily: "'Courier New', monospace",
  },
  addBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  summaryCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 20,
  },
  emptyOrder: {
    textAlign: "center",
    color: "#334155",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
    padding: "30px 0",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  orderItemName: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: 600,
  },
  orderItemQty: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginTop: 2,
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 16,
    transition: "color 0.2s",
    padding: 4,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0 4px",
  },
  totalLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  totalValue: {
    color: "#f0f6ff",
    fontSize: 20,
    fontWeight: 700,
  },
  completeBtn: {
    width: "100%",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
    marginTop: 16,
  },
  recentCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
  },
  recentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  recentId: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  recentStatus: {
    color: "#4ade80",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  recentDate: {
    color: "#475569",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  emptyRow: {
    textAlign: "center",
    padding: "40px",
    color: "#334155",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};