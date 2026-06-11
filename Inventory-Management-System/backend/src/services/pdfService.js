const PDFDocument = require('pdfkit');
const pool = require('../config/db');

async function generateReport(ownerId, startDate, endDate) {

  // ── Fetch all data needed for the report ──────────────────────
  const { rows: orderSummary } = await pool.query(
    `SELECT
      COUNT(*)                                                          AS total_orders,
      COUNT(*) FILTER (WHERE status IN ('completed','dispatched','delivered')) AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')                     AS cancelled,
      COALESCE(SUM(total_amount) FILTER (
        WHERE status IN ('completed','dispatched','delivered')
      ), 0)                                                             AS revenue
     FROM orders
     WHERE owner_id = $1 AND DATE(created_at) BETWEEN $2 AND $3`,
    [ownerId, startDate, endDate]
  );

  const { rows: dailyBreakdown } = await pool.query(
    `SELECT
      DATE(created_at) AS day,
      COUNT(*)         AS orders,
      SUM(total_amount) AS revenue
     FROM orders
     WHERE owner_id = $1
       AND status IN ('completed','dispatched','delivered')
       AND DATE(created_at) BETWEEN $2 AND $3
     GROUP BY day ORDER BY day`,
    [ownerId, startDate, endDate]
  );

  const { rows: topProducts } = await pool.query(
    `SELECT
      p.name,
      SUM(oi.quantity) AS total_sold,
      SUM(oi.quantity * oi.unit_price) AS revenue
     FROM order_items oi
     JOIN orders o   ON oi.order_id  = o.id
     JOIN products p ON oi.product_id = p.id
     WHERE o.owner_id = $1
       AND o.status IN ('completed','dispatched','delivered')
       AND DATE(o.created_at) BETWEEN $2 AND $3
     GROUP BY p.name
     ORDER BY total_sold DESC
     LIMIT 5`,
    [ownerId, startDate, endDate]
  );

  // ── Build the PDF ─────────────────────────────────────────────
  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', chunk => buffers.push(chunk));

  const s = orderSummary[0];
  const formatRs = (amount) =>
    `Rs ${Number(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  // Header
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Inventory Management System', { align: 'center' });

  doc
    .fontSize(13)
    .font('Helvetica')
    .text('Sales & Order Report', { align: 'center' });

  doc
    .fontSize(11)
    .fillColor('gray')
    .text(`Period: ${startDate}  to  ${endDate}`, { align: 'center' });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown();

  // ── Order Summary Section ─────────────────────────────────────
  doc.fillColor('black').fontSize(14).font('Helvetica-Bold').text('Order Summary');
  doc.moveDown(0.5);

  const summaryRows = [
    ['Total Orders',     s.total_orders],
    ['Completed Orders', s.completed],
    ['Cancelled Orders', s.cancelled],
    ['Total Revenue',    formatRs(s.revenue)],
  ];

  summaryRows.forEach(([label, value]) => {
    doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(String(value));
  });

  // ── Daily Breakdown Section ───────────────────────────────────
  if (dailyBreakdown.length > 0) {
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Daily Breakdown');
    doc.moveDown(0.5);

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date',       50,  doc.y, { width: 150 });
    doc.text('Orders',    200, doc.y - doc.currentLineHeight(), { width: 100 });
    doc.text('Revenue',   300, doc.y - doc.currentLineHeight(), { width: 200 });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).strokeColor('#eeeeee').stroke();
    doc.moveDown(0.3);

    // Table rows
    dailyBreakdown.forEach(row => {
      doc.fontSize(10).font('Helvetica');
      const y = doc.y;
      doc.text(String(row.day).split('T')[0], 50,  y, { width: 150 });
      doc.text(String(row.orders),           200,  y, { width: 100 });
      doc.text(formatRs(row.revenue),        300,  y, { width: 200 });
      doc.moveDown(0.3);
    });
  }

  // ── Top Products Section ──────────────────────────────────────
  if (topProducts.length > 0) {
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('Top Products');
    doc.moveDown(0.5);

    topProducts.forEach((p, i) => {
      doc.fontSize(11).font('Helvetica');
      doc.text(`${i + 1}.  ${p.name}  —  ${p.total_sold} units sold  —  ${formatRs(p.revenue)}`);
      doc.moveDown(0.3);
    });
  }

  // ── Footer ────────────────────────────────────────────────────
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
  doc.moveDown(0.5);
  doc
    .fontSize(9)
    .fillColor('gray')
    .text(`Generated on: ${new Date().toLocaleString('en-PK')}`, { align: 'right' });

  doc.end();

  return new Promise(resolve => doc.on('end', () => resolve(Buffer.concat(buffers))));
}

module.exports = { generateReport };