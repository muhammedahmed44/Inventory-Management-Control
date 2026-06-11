const pool = require("../config/db");
const { formatCurrency } = require("../config/constants");
const { generateReport } = require("../services/pdfService"); // ← was missing

const getDailySummary = async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const ownerId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT
        COUNT(*)                                                              AS total_orders,
        COUNT(*) FILTER (WHERE status IN ('completed','dispatched','delivered')) AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')                         AS cancelled_orders,
        COUNT(*) FILTER (WHERE status = 'pending')                           AS pending_orders,
        COALESCE(SUM(total_amount) FILTER (
          WHERE status IN ('completed','dispatched','delivered')
        ), 0)                                                                 AS total_revenue
       FROM orders
       WHERE owner_id = $1 AND DATE(created_at) = $2`,
      [ownerId, date],
    );

    const s = rows[0];
    res.json({
      success: true,
      date,
      summary: {
        total_orders: parseInt(s.total_orders),
        completed_orders: parseInt(s.completed_orders),
        cancelled_orders: parseInt(s.cancelled_orders),
        pending_orders: parseInt(s.pending_orders),
        total_revenue: formatCurrency(s.total_revenue),
      },
    });
  } catch (err) {
    console.error("Daily summary error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getRevenue = async (req, res) => {
  const ownerId = req.user.id;
  const start = req.query.start || new Date().toISOString().split("T")[0];
  const end = req.query.end || start;

  try {
    const { rows: summary } = await pool.query(
      `SELECT
        COALESCE(SUM(total_amount), 0)           AS total_revenue,
        COUNT(*)                                  AS total_orders,
        COALESCE(ROUND(AVG(total_amount), 2), 0) AS avg_order_value
       FROM orders
       WHERE owner_id = $1
         AND status IN ('completed','dispatched','delivered')
         AND DATE(created_at) BETWEEN $2 AND $3`,
      [ownerId, start, end],
    );

    const { rows: daily } = await pool.query(
      `SELECT
        DATE(created_at)  AS day,
        COUNT(*)          AS orders,
        SUM(total_amount) AS revenue
       FROM orders
       WHERE owner_id = $1
         AND status IN ('completed','dispatched','delivered')
         AND DATE(created_at) BETWEEN $2 AND $3
       GROUP BY day
       ORDER BY day ASC`,
      [ownerId, start, end],
    );

    const s = summary[0];
    res.json({
      success: true,
      period: { start, end },
      summary: {
        total_revenue: formatCurrency(s.total_revenue),
        total_orders: parseInt(s.total_orders),
        avg_order_value: formatCurrency(s.avg_order_value),
      },
      daily: daily.map((d) => ({
        day: d.day,
        orders: parseInt(d.orders),
        revenue: formatCurrency(d.revenue),
      })),
    });
  } catch (err) {
    console.error("Revenue error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTopProducts = async (req, res) => {
  const ownerId = req.user.id;
  const start = req.query.start || new Date().toISOString().split("T")[0];
  const end = req.query.end || start;

  try {
    const { rows } = await pool.query(
      `SELECT
        p.name,
        SUM(oi.quantity)                 AS total_sold,
        SUM(oi.quantity * oi.unit_price) AS total_revenue
       FROM order_items oi
       JOIN orders o   ON oi.order_id  = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.owner_id = $1
         AND o.status IN ('completed','dispatched','delivered')
         AND DATE(o.created_at) BETWEEN $2 AND $3
       GROUP BY p.name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [ownerId, start, end],
    );

    res.json({
      success: true,
      period: { start, end },
      top_products: rows.map((p) => ({
        name: p.name,
        total_sold: parseInt(p.total_sold),
        total_revenue: formatCurrency(p.total_revenue),
      })),
    });
  } catch (err) {
    console.error("Top products error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const downloadPDF = async (req, res) => {
  const start = req.query.start || new Date().toISOString().split("T")[0];
  const end = req.query.end || start;

  try {
    const buffer = await generateReport(req.user.id, start, end);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="IMS_Report_${start}_to_${end}.pdf"`,
    );
    res.send(buffer);
  } catch (err) {
    console.error("PDF error:", err.message);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};

module.exports = { getDailySummary, getRevenue, getTopProducts, downloadPDF };
