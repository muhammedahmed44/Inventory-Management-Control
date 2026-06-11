import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function RiderDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOrders();
  }, []);

  // GET RIDER ORDERS
  const fetchOrders = async () => {
    try {
      const res = await api.get("/rider/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  // MARK AS DELIVERED
  const markDelivered = async (id) => {
    setActionLoading(`deliver-${id}`);
    try {
      await api.put(`/rider/orders/${id}/deliver`);
      alert("✅ Order marked as delivered!");
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order");
    } finally {
      setActionLoading("");
    }
  };

  // MARK AS CANCELLED
  const markCancelled = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(`cancel-${id}`);
    try {
      await api.put(`/rider/orders/${id}/cancel`);
      alert("Order marked as cancelled");
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoading("");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return { color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" };
      case "cancelled":
        return { color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" };
      case "dispatched":
        return { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)" };
      case "assigned":
        return { color: "#fbbf24", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" };
      default:
        return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
    }
  };

  const pendingOrders = orders.filter(
    (o) => o.status === "assigned" || o.status === "dispatched"
  );
  const completedOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  );

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingWrap}>
          <div style={styles.loadingText}>Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navIcon}>🚴</div>
          <div>
            <div style={styles.navTitle}>Rider Dashboard</div>
            <div style={styles.navSub}>IMS Delivery</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <div style={styles.riderName}>👤 {user.name || "Rider"}</div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            style={styles.logoutBtn}
            onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.2)"}
            onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.1)"}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>

        {/* STATS ROW */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.1)" }}>
            <div style={styles.statValue}>{orders.length}</div>
            <div style={styles.statLabel}>Total Assigned</div>
          </div>
          <div style={{ ...styles.statCard, border: "1px solid rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.1)" }}>
            <div style={{ ...styles.statValue, color: "#fbbf24" }}>{pendingOrders.length}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={{ ...styles.statCard, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.1)" }}>
            <div style={{ ...styles.statValue, color: "#4ade80" }}>
              {orders.filter(o => o.status === "delivered").length}
            </div>
            <div style={styles.statLabel}>Delivered</div>
          </div>
        </div>

        {/* ACTIVE ORDERS */}
        <div style={styles.sectionTitle}>🚚 Active Orders ({pendingOrders.length})</div>

        {pendingOrders.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={styles.emptyText}>No active orders right now</div>
            <div style={styles.emptySubText}>Check back later for new deliveries</div>
          </div>
        ) : (
          <div style={styles.orderGrid}>
            {pendingOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const isExpanded = selectedOrder === order.id;

              return (
                <div key={order.id} style={styles.orderCard}>

                  {/* ORDER HEADER */}
                  <div
                    style={styles.orderHeader}
                    onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                  >
                    <div>
                      <div style={styles.orderId}>Order #{order.id}</div>
                      <div style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString()} —{" "}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <div style={styles.orderHeaderRight}>
                      <span style={{
                        ...styles.statusBadge,
                        color: statusStyle.color,
                        background: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                      }}>
                        {order.status}
                      </span>
                      <span style={styles.expandIcon}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* ORDER DETAILS — expanded */}
                  {isExpanded && (
                    <div style={styles.orderDetails}>

                      {/* Items */}
                      {order.items && order.items.length > 0 && (
                        <div style={styles.itemsSection}>
                          <div style={styles.detailLabel}>Items</div>
                          {order.items.map((item, i) => (
                            <div key={i} style={styles.itemRow}>
                              <span style={styles.itemName}>
                                {item.product_name || `Product #${item.product_id}`}
                              </span>
                              <span style={styles.itemQty}>x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Total */}
                      {order.total_amount && (
                        <div style={styles.totalRow}>
                          <span style={styles.detailLabel}>Total Amount</span>
                          <span style={styles.totalValue}>{order.total_amount}</span>
                        </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div style={styles.actionRow}>
                        <button
                          onClick={() => markDelivered(order.id)}
                          disabled={actionLoading === `deliver-${order.id}`}
                          style={{
                            ...styles.actionBtn,
                            ...styles.deliverBtn,
                            opacity: actionLoading === `deliver-${order.id}` ? 0.7 : 1,
                            cursor: actionLoading === `deliver-${order.id}` ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={e => { if (!actionLoading) e.target.style.background = "#16a34a"; }}
                          onMouseLeave={e => e.target.style.background = "#22c55e"}
                        >
                          {actionLoading === `deliver-${order.id}`
                            ? "Updating..."
                            : "✅ Delivered"}
                        </button>

                        <button
                          onClick={() => markCancelled(order.id)}
                          disabled={actionLoading === `cancel-${order.id}`}
                          style={{
                            ...styles.actionBtn,
                            ...styles.cancelBtn,
                            opacity: actionLoading === `cancel-${order.id}` ? 0.7 : 1,
                            cursor: actionLoading === `cancel-${order.id}` ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={e => { if (!actionLoading) e.target.style.background = "rgba(239,68,68,0.2)"; }}
                          onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.1)"}
                        >
                          {actionLoading === `cancel-${order.id}`
                            ? "Updating..."
                            : "❌ Cancel"}
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* COMPLETED ORDERS */}
        {completedOrders.length > 0 && (
          <>
            <div style={{ ...styles.sectionTitle, marginTop: 28 }}>
              📦 Completed Orders ({completedOrders.length})
            </div>
            <div style={styles.orderGrid}>
              {completedOrders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div key={order.id} style={{ ...styles.orderCard, opacity: 0.7 }}>
                    <div style={styles.orderHeader}>
                      <div>
                        <div style={styles.orderId}>Order #{order.id}</div>
                        <div style={styles.orderDate}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        color: statusStyle.color,
                        background: statusStyle.bg,
                        border: `1px solid ${statusStyle.border}`,
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

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
    height: "100vh",
  },
  loadingText: {
    color: "#475569",
    fontSize: 16,
    fontFamily: "'Courier New', monospace",
  },
  navbar: {
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navIcon: {
    fontSize: 28,
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    borderRadius: 10,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    color: "#f0f6ff",
    fontWeight: 700,
    fontSize: 16,
  },
  navSub: {
    color: "#475569",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  riderName: {
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  container: {
    padding: "24px",
    maxWidth: 900,
    margin: "0 auto",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    borderRadius: 14,
    padding: "18px",
    textAlign: "center",
  },
  statValue: {
    color: "#3b82f6",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: 600,
  },
  emptyCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "50px 24px",
    textAlign: "center",
  },
  emptyText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6,
  },
  emptySubText: {
    color: "#475569",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  orderGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  orderCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    cursor: "pointer",
  },
  orderId: {
    color: "#f0f6ff",
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 3,
  },
  orderDate: {
    color: "#475569",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  orderHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  expandIcon: {
    color: "#475569",
    fontSize: 11,
  },
  orderDetails: {
    borderTop: "1px solid rgba(255,255,255,0.07)",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.02)",
  },
  itemsSection: {
    marginBottom: 14,
  },
  detailLabel: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  itemName: {
    color: "#e2e8f0",
    fontSize: 14,
  },
  itemQty: {
    color: "#94a3b8",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    marginBottom: 14,
  },
  totalValue: {
    color: "#f0f6ff",
    fontSize: 16,
    fontWeight: 700,
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  actionBtn: {
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  deliverBtn: {
    background: "#22c55e",
    color: "#fff",
  },
  cancelBtn: {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
  },
};