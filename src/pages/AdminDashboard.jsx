import { useCallback, useEffect, useState } from "react";
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

  // --- SVG Revenue Chart Calculations ---
  const timeline = analytics?.timeline || [];
  const maxRevenue = Math.max(...timeline.map((t) => t.revenue || 0), 100);

  // SVG Chart ViewBox Dimensions
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartPoints = timeline.map((item, index) => {
    const x =
      paddingX +
      (index / Math.max(timeline.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((item.revenue || 0) / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, period: item.period, revenue: item.revenue || 0 };
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
        {/* Header */}
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

        {/* Low Stock Notification */}
        {stats?.lowStockCount > 0 && (
          <div className={styles.alertBanner}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className={styles.alertContent}>
              <strong>Inventory Notice:</strong> {stats.lowStockCount} product(s) have 5 or fewer items remaining in stock.
            </div>
            <Link to="/admin/products" className={styles.alertAction}>
              Review Stock
            </Link>
          </div>
        )}

        {/* KPI CARDS GRID */}
        <div className={styles.statsGrid}>
          {/* Revenue */}
          <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
            <div className={styles.statHeader}>
              <span>Total Revenue</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{money(stats?.totalEarnings)}</strong>
            <small className={styles.statCaption}>From verified checkouts</small>
          </div>

          {/* Total Orders */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Orders</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{stats?.totalOrders ?? 0}</strong>
            <small className={styles.statCaption}>
              {stats?.pendingOrders ?? 0} pending fulfillment
            </small>
          </div>

          {/* Completed Orders */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Completed Orders</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{stats?.completedOrders ?? 0}</strong>
            <small className={styles.statCaption}>Delivered successfully</small>
          </div>

          {/* Total Products */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Products</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{stats?.totalProducts ?? 0}</strong>
            <small className={styles.statCaption}>
              <Link to="/admin/products">Manage catalog →</Link>
            </small>
          </div>

          {/* Categories */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Categories</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{stats?.totalCategories ?? 0}</strong>
            <small className={styles.statCaption}>
              <Link to="/admin/categories">Manage groups →</Link>
            </small>
          </div>

          {/* Total Users */}
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Users</span>
              <div className={styles.statIconBadge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <strong className={styles.statValue}>{stats?.totalUsers ?? 0}</strong>
            <small className={styles.statCaption}>
              <Link to="/admin/users">View customers →</Link>
            </small>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className={styles.chartsGrid}>
          {/* Revenue Over Time Area Chart */}
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Revenue Over Time</h2>
                <p>Aggregated revenue trends from completed orders</p>
              </div>
              <span className={styles.liveBadge}>
                <span className={styles.pulseDot}></span>
                Live Metrics
              </span>
            </div>

            {timeline.length === 0 ? (
              <div className={styles.chartEmpty}>
                <p>No historical transactions recorded yet.</p>
              </div>
            ) : (
              <div className={styles.svgChartContainer}>
                <svg
                  className={styles.revenueSvg}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line
                    x1={paddingX}
                    y1={paddingY}
                    x2={chartWidth - paddingX}
                    y2={paddingY}
                    className={styles.gridLine}
                  />
                  <line
                    x1={paddingX}
                    y1={(chartHeight - paddingY) / 2 + paddingY / 2}
                    x2={chartWidth - paddingX}
                    y2={(chartHeight - paddingY) / 2 + paddingY / 2}
                    className={styles.gridLine}
                  />
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingY}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingY}
                    className={styles.baseLine}
                  />

                  {/* Area Gradient Fill */}
                  <path d={areaPathD} fill="url(#revenueGrad)" />

                  {/* Top Curve Line */}
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points & Dynamic Tooltip Labels */}
                  {chartPoints.map((pt) => (
                    <g key={pt.period} className={styles.chartPointGroup}>
                      {/* Vertical Guideline */}
                      <line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={chartHeight - paddingY}
                        className={styles.pointGuide}
                      />
                      {/* Circle Indicator */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        className={styles.chartCircle}
                      />
                      {/* Price Label */}
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className={styles.chartValueText}
                      >
                        ${pt.revenue}
                      </text>
                      {/* Time Period Label */}
                      <text
                        x={pt.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        className={styles.chartLabelText}
                      >
                        {pt.period}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Fulfillment Distribution</h2>
                <p>Status summary across all store orders</p>
              </div>
            </div>

            <div className={styles.statusBarsList}>
              {statusBreakdown.length === 0 ? (
                <p className={styles.chartEmptyText}>No orders placed yet.</p>
              ) : (
                statusBreakdown.map((item) => {
                  const pct = Math.round((item.count / totalStatusCount) * 100);
                  const statusKey = (item.status || "pending").toLowerCase();

                  return (
                    <div className={styles.statusBarItem} key={statusKey}>
                      <div className={styles.statusLabelRow}>
                        <span className={`${styles.statusBadge} ${styles[statusKey]}`}>
                          {item.status || "pending"}
                        </span>
                        <span className={styles.statusCount}>
                          <strong>{item.count} orders</strong> ({pct}%)
                        </span>
                      </div>
                      <div className={styles.statusTrack}>
                        <div
                          className={`${styles.statusFill} ${styles[statusKey]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Products by Category Summary */}
            <div className={styles.categorySummary}>
              <h3 className={styles.subheading}>Catalog by Category</h3>
              <div className={styles.categoryWrap}>
                {(analytics?.productsByCategory || []).map((cat) => (
                  <span className={styles.catTag} key={cat.category}>
                    {cat.category}: <strong>{cat.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Recent Customer Orders</h2>
              <p>Quickly inspect or update order shipping status</p>
            </div>

            <Link className={styles.secondaryBtn} to="/admin/orders">
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className={styles.panelEmpty}>
              <p>No customer orders in database yet.</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong className={styles.orderId}>
                          #{String(order._id).slice(-8)}
                        </strong>
                      </td>
                      <td>
                        <div className={styles.customerBox}>
                          <strong className={styles.customerName}>
                            {order.userId?.name ||
                              order.shippingDetails?.fullName ||
                              "Customer"}
                          </strong>
                          <span className={styles.customerEmail}>
                            {order.userId?.email || order.shippingDetails?.email}
                          </span>
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td>
                        <strong className={styles.totalAmount}>
                          {money(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`${styles.paymentPill} ${
                            styles[order.paymentStatus || "unpaid"]
                          }`}
                        >
                          {order.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td>
                        <select
                          className={styles.statusSelect}
                          value={order.orderStatus || "pending"}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
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
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;