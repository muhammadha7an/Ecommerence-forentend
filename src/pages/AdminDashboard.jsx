import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import styles from "../style/AdminDashboard.module.css";

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    (amount || 0) / 100
  );

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // --- Graph Date Range & Hover Tooltip State ---
  const [rangeDays, setRangeDays] = useState(7); // Default: Last 7 Days
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, analyticsRes, ordersRes] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminAnalytics(),
        authService.getAdminOrders(),
      ]);

      setStats(overviewRes.stats);
      setAnalytics(analyticsRes.analytics);
      setRecentOrders((ordersRes.orders || []).slice(0, 6));
      setError("");
    } catch (err) {
      console.error("Admin dashboard load error:", err);
      if (err.response?.status === 401) {
        authService.logout();
        navigate("/admin/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await authService.updateAdminOrderStatus(orderId, newStatus);
      setRecentOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      const overview = await authService.getAdminOverview();
      setStats(overview.stats);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Dynamic Timeline Data Generator ---
  const dailyTimeline = useMemo(() => {
    const rawTimeline = analytics?.timeline || [];
    const result = [];
    const today = new Date();

    for (let i = rangeDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      // Match YYYY-MM-DD
      const dateKey = date.toISOString().split("T")[0];
      const displayLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const matchedItem = rawTimeline.find(
        (item) =>
          item.period === dateKey ||
          item.date === dateKey ||
          item._id === dateKey
      );

      result.push({
        fullDate: date.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        period: displayLabel,
        revenue: matchedItem ? matchedItem.revenue || 0 : 0,
      });
    }

    return result;
  }, [analytics, rangeDays]);

  // --- Active Date Text Badge (e.g., Sep 1, 2026 - Sep 7, 2026) ---
  const activeDateRangeText = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (rangeDays - 1));

    const options = { month: "short", day: "numeric", year: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString(
      "en-US",
      options
    )}`;
  }, [rangeDays]);

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading real-time admin metrics...</p>
        </div>
      </div>
    );
  }

  // --- Dynamic SVG Graph Calculations ---
  const maxRevenue = Math.max(...dailyTimeline.map((t) => t.revenue || 0), 100);
  const chartWidth = 750;
  const chartHeight = 250;
  const paddingX = 50;
  const paddingY = 40;

  const chartPoints = dailyTimeline.map((item, index) => {
    const x =
      paddingX +
      (index / Math.max(dailyTimeline.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((item.revenue || 0) / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, ...item };
  });

  const linePathD =
    chartPoints.length > 0
      ? chartPoints.reduce(
          (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
          ""
        )
      : "";

  const areaPathD =
    chartPoints.length > 0
      ? `${linePathD} L ${chartPoints[chartPoints.length - 1].x} ${
          chartHeight - paddingY
        } L ${chartPoints[0].x} ${chartHeight - paddingY} Z`
      : "";

  const statusBreakdown = analytics?.statusBreakdown || [];
  const totalStatusCount =
    statusBreakdown.reduce((sum, s) => sum + (s.count || 0), 0) || 1;

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.welcomeBadge}>Store Control Center</span>
            <h1 className={styles.title}>Administrator Dashboard</h1>
            <p className={styles.subtitle}>
              Live metrics, revenue tracking, and order fulfillment overview
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.primaryBtn} to="/admin/products/add">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Product</span>
            </Link>
            <button className={styles.outlineBtn} onClick={loadData} title="Refresh data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* KPI CARDS */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
            <div className={styles.statHeader}>
              <span>Total Revenue</span>
            </div>
            <strong className={styles.statValue}>{money(stats?.totalEarnings)}</strong>
            <small className={styles.statCaption}>Overall store earnings</small>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Orders</span>
            </div>
            <strong className={styles.statValue}>{stats?.totalOrders ?? 0}</strong>
            <small className={styles.statCaption}>
              {stats?.pendingOrders ?? 0} pending fulfillment
            </small>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Products</span>
            </div>
            <strong className={styles.statValue}>{stats?.totalProducts ?? 0}</strong>
            <small className={styles.statCaption}>Active in inventory</small>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Users</span>
            </div>
            <strong className={styles.statValue}>{stats?.totalUsers ?? 0}</strong>
            <small className={styles.statCaption}>Registered accounts</small>
          </div>
        </div>

        {/* --- DYNAMIC REVENUE GRAPH SECTION --- */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartPanel} style={{ position: "relative" }}>
            <div className={styles.panelHeader} style={{ flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2>Daily Earnings Trend</h2>
                <span className={styles.activeDateRange}>{activeDateRangeText}</span>
              </div>

              {/* DATE RANGE FILTER BUTTONS */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  background: "#1e293b",
                  padding: "4px",
                  borderRadius: "8px",
                }}
              >
                {[7, 15, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setRangeDays(days)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: rangeDays === days ? "#6366f1" : "transparent",
                      color: rangeDays === days ? "#ffffff" : "#94a3b8",
                    }}
                  >
                    Last {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* HOVER TOOLTIP CARD */}
            {hoveredPoint && (
              <div
                style={{
                  position: "absolute",
                  top: "70px",
                  right: "24px",
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid #6366f1",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                  {hoveredPoint.fullDate}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "15px", fontWeight: "bold", color: "#38bdf8" }}>
                  {money(hoveredPoint.revenue)}
                </p>
              </div>
            )}

            {/* SVG CHART CONTAINER */}
            <div className={styles.svgChartContainer} style={{ marginTop: "15px" }}>
              <svg
                className={styles.revenueSvg}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                style={{ width: "100%", height: "240px", overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="4" />
                <line x1={paddingX} y1={(chartHeight - paddingY) / 2 + paddingY / 2} x2={chartWidth - paddingX} y2={(chartHeight - paddingY) / 2 + paddingY / 2} stroke="#334155" strokeDasharray="4" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#475569" strokeWidth="1.5" />

                {/* Area & Line */}
                <path d={areaPathD} fill="url(#revenueGrad)" />
                <path d={linePathD} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points & Interactive Nodes */}
                {chartPoints.map((pt, i) => {
                  // Hide some text labels if 30 days selected to prevent overlapping
                  const showLabel = rangeDays === 30 ? i % 3 === 0 : true;

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Vertical line on hover */}
                      <line x1={pt.x} y1={pt.y} x2={pt.x} y2={chartHeight - paddingY} stroke="#4f46e5" strokeDasharray="2" strokeWidth="1" />

                      {/* Point Circle */}
                      <circle cx={pt.x} cy={pt.y} r={hoveredPoint?.period === pt.period ? "7" : "4.5"} fill={hoveredPoint?.period === pt.period ? "#38bdf8" : "#818cf8"} stroke="#0f172a" strokeWidth="2" />

                      {/* Top Price Text (Shows for 7 & 15 days) */}
                      {rangeDays <= 15 && pt.revenue > 0 && (
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#cbd5e1" fontSize="10px" fontWeight="600">
                          {money(pt.revenue)}
                        </text>
                      )}

                      {/* Bottom Date Label */}
                      {showLabel && (
                        <text x={pt.x} y={chartHeight - 12} textAnchor="middle" fill="#94a3b8" fontSize="11px">
                          {pt.period}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Fulfillment Status */}
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <h2>Order Fulfillment</h2>
            </div>
            <div className={styles.statusBarsList}>
              {statusBreakdown.map((item) => {
                const pct = Math.round((item.count / totalStatusCount) * 100);
                const statusKey = (item.status || "pending").toLowerCase();
                return (
                  <div className={styles.statusBarItem} key={statusKey}>
                    <div className={styles.statusLabelRow}>
                      <span className={`${styles.statusBadge} ${styles[statusKey]}`}>{item.status}</span>
                      <span className={styles.statusCount}><strong>{item.count}</strong> ({pct}%)</span>
                    </div>
                    <div className={styles.statusTrack}>
                      <div className={`${styles.statusFill} ${styles[statusKey]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Recent Customer Orders</h2>
            <Link className={styles.secondaryBtn} to="/admin/orders">
              View All Orders →
            </Link>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>#{String(order._id).slice(-8)}</strong></td>
                    <td>{order.userId?.name || order.shippingDetails?.fullName || "Customer"}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><strong>{money(order.totalAmount)}</strong></td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={order.orderStatus || "pending"}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;