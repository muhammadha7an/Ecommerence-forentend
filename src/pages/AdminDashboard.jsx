
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import styles from "../style/AdminDashboard.module.css";

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((Number(amount) || 0) / 100);

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 Days" },
  { value: 14, label: "Last 14 Days" },
  { value: 30, label: "Last 30 Days" },
];

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  if (!value) return null;

  const stringValue = String(value);

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return getLocalDateKey(date);
}

function formatDateLabel(dateKey, range) {
  const date = new Date(`${dateKey}T12:00:00`);

  if (range <= 14) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getNiceMax(value) {
  if (value <= 0) return 100;

  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  let niceNumber;

  if (normalized <= 1) {
    niceNumber = 1;
  } else if (normalized <= 2) {
    niceNumber = 2;
  } else if (normalized <= 5) {
    niceNumber = 5;
  } else {
    niceNumber = 10;
  }

  return niceNumber * magnitude;
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Graph range
  const [dateRange, setDateRange] = useState(7);

  // Graph hover
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [overviewRes, analyticsRes, ordersRes] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminAnalytics(),
        authService.getAdminOrders(),
      ]);

      setStats(overviewRes?.stats || null);
      setAnalytics(analyticsRes?.analytics || null);
      setRecentOrders((ordersRes?.orders || []).slice(0, 6));

      setError("");
    } catch (err) {
      console.error("Admin dashboard load error:", err);

      if (err.response?.status === 401) {
        authService.logout();
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data"
      );
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
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: newStatus,
              }
            : order
        )
      );

      const [overviewRes, analyticsRes] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminAnalytics(),
      ]);

      setStats(overviewRes?.stats || null);
      setAnalytics(analyticsRes?.analytics || null);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * ============================================================
   * DAILY REVENUE DATA
   * ============================================================
   *
   * Backend can return:
   *
   * {
   *   period: "2026-09-07",
   *   revenue: 25000
   * }
   *
   * OR
   *
   * {
   *   date: "2026-09-07",
   *   revenue: 25000
   * }
   *
   * OR
   *
   * {
   *   _id: "2026-09-07",
   *   revenue: 25000
   * }
   */

  const dailyTimeline = useMemo(() => {
    const rawTimeline = Array.isArray(analytics?.timeline)
      ? analytics.timeline
      : [];

    const revenueMap = new Map();

    rawTimeline.forEach((item) => {
      const rawDate =
        item?.period ||
        item?.date ||
        item?._id;

      const dateKey = parseDateKey(rawDate);

      if (!dateKey) return;

      const revenue = Number(item?.revenue || 0);

      revenueMap.set(
        dateKey,
        (revenueMap.get(dateKey) || 0) + revenue
      );
    });

    const result = [];
    const today = new Date();

    for (let i = dateRange - 1; i >= 0; i--) {
      const date = new Date(today);

      date.setHours(12, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const dateKey = getLocalDateKey(date);

      result.push({
        dateKey,
        period: formatDateLabel(dateKey, dateRange),
        fullDate: formatFullDate(dateKey),
        revenue: revenueMap.get(dateKey) || 0,
      });
    }

    return result;
  }, [analytics, dateRange]);

  /*
   * ============================================================
   * GRAPH CALCULATIONS
   * ============================================================
   */

  const chartWidth = 900;
  const chartHeight = 360;

  const paddingLeft = 70;
  const paddingRight = 25;
  const paddingTop = 45;
  const paddingBottom = 55;

  const graphWidth =
    chartWidth - paddingLeft - paddingRight;

  const graphHeight =
    chartHeight - paddingTop - paddingBottom;

  const maxRevenue = useMemo(() => {
    const highest = Math.max(
      ...dailyTimeline.map((item) =>
        Number(item.revenue || 0)
      ),
      0
    );

    return getNiceMax(highest);
  }, [dailyTimeline]);

  const yAxisValues = useMemo(() => {
    const steps = 5;

    return Array.from({ length: steps + 1 }, (_, index) => {
      return (maxRevenue / steps) * index;
    }).reverse();
  }, [maxRevenue]);

  const chartPoints = useMemo(() => {
    if (!dailyTimeline.length) return [];

    return dailyTimeline.map((item, index) => {
      const denominator = Math.max(
        dailyTimeline.length - 1,
        1
      );

      const x =
        paddingLeft +
        (index / denominator) * graphWidth;

      const revenue = Number(item.revenue || 0);

      const y =
        paddingTop +
        graphHeight -
        (revenue / maxRevenue) * graphHeight;

      return {
        ...item,
        x,
        y,
      };
    });
  }, [
    dailyTimeline,
    graphWidth,
    graphHeight,
    maxRevenue,
  ]);

  const linePathD = useMemo(() => {
    if (!chartPoints.length) return "";

    return chartPoints
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");
  }, [chartPoints]);

  const areaPathD = useMemo(() => {
    if (!chartPoints.length) return "";

    const firstPoint = chartPoints[0];
    const lastPoint =
      chartPoints[chartPoints.length - 1];

    const bottomY =
      paddingTop + graphHeight;

    return `
      ${linePathD}
      L ${lastPoint.x} ${bottomY}
      L ${firstPoint.x} ${bottomY}
      Z
    `;
  }, [
    chartPoints,
    linePathD,
    graphHeight,
  ]);

  const totalDailyRevenue = useMemo(() => {
    return dailyTimeline.reduce(
      (sum, item) =>
        sum + Number(item.revenue || 0),
      0
    );
  }, [dailyTimeline]);

  /*
   * ============================================================
   * STATUS BREAKDOWN
   * ============================================================
   */

  const statusBreakdown =
    analytics?.statusBreakdown || [];

  const totalStatusCount =
    statusBreakdown.reduce(
      (sum, item) =>
        sum + Number(item.count || 0),
      0
    ) || 1;

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

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className={styles.header}>
          <div>
            <span className={styles.welcomeBadge}>
              Store Control Center
            </span>

            <h1 className={styles.title}>
              Administrator Dashboard
            </h1>

            <p className={styles.subtitle}>
              Live metrics, revenue tracking, and order
              fulfillment overview
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link
              className={styles.primaryBtn}
              to="/admin/products/add"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>

              <span>Add Product</span>
            </Link>

            <button
              className={styles.outlineBtn}
              onClick={loadData}
              title="Refresh data"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>

              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        {/* =====================================================
            LOW STOCK
        ====================================================== */}

        {stats?.lowStockCount > 0 && (
          <div className={styles.alertBanner}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              />
            </svg>

            <div className={styles.alertContent}>
              <strong>
                Inventory Notice:
              </strong>{" "}
              {stats.lowStockCount} product(s) have
              5 or fewer items remaining in stock.
            </div>

            <Link
              to="/admin/products"
              className={styles.alertAction}
            >
              Review Stock
            </Link>
          </div>
        )}

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <div className={styles.statsGrid}>

          {/* Revenue */}

          <div
            className={`${styles.statCard} ${styles.statCardHighlight}`}
          >
            <div className={styles.statHeader}>
              <span>Total Revenue</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line
                    x1="12"
                    y1="1"
                    x2="12"
                    y2="23"
                  />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {money(stats?.totalEarnings)}
            </strong>

            <small className={styles.statCaption}>
              From verified checkouts
            </small>
          </div>

          {/* Orders */}

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Orders</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {stats?.totalOrders ?? 0}
            </strong>

            <small className={styles.statCaption}>
              {stats?.pendingOrders ?? 0} pending
              fulfillment
            </small>
          </div>

          {/* Completed */}

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Completed Orders</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {stats?.completedOrders ?? 0}
            </strong>

            <small className={styles.statCaption}>
              Delivered successfully
            </small>
          </div>

          {/* Products */}

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Products</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line
                    x1="7"
                    y1="7"
                    x2="7.01"
                    y2="7"
                  />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {stats?.totalProducts ?? 0}
            </strong>

            <small className={styles.statCaption}>
              <Link to="/admin/products">
                Manage catalog →
              </Link>
            </small>
          </div>

          {/* Categories */}

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Categories</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {stats?.totalCategories ?? 0}
            </strong>

            <small className={styles.statCaption}>
              <Link to="/admin/categories">
                Manage groups →
              </Link>
            </small>
          </div>

          {/* Users */}

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span>Total Users</span>

              <div className={styles.statIconBadge}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                  />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>

            <strong className={styles.statValue}>
              {stats?.totalUsers ?? 0}
            </strong>

            <small className={styles.statCaption}>
              <Link to="/admin/users">
                View customers →
              </Link>
            </small>
          </div>
        </div>

        {/* =====================================================
            CHARTS
        ====================================================== */}

        <div className={styles.chartsGrid}>

          {/* =================================================
              DAILY EARNINGS GRAPH
          ================================================== */}

          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>
                  Daily Earnings
                </h2>

                <p>
                  Revenue generated per day
                </p>
              </div>

              {/* DATE RANGE BUTTON */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "18px",
                    }}
                  >
                    {money(totalDailyRevenue)}
                  </strong>

                  <small>
                    Selected period
                  </small>
                </div>

                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(
                      Number(e.target.value)
                    );
                    setHoveredPoint(null);
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {RANGE_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {dailyTimeline.length === 0 ? (
              <div className={styles.chartEmpty}>
                <p>
                  No historical transactions
                  recorded yet.
                </p>
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  overflowX: "auto",
                  position: "relative",
                }}
              >
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  style={{
                    width: "100%",
                    minWidth:
                      dateRange >= 30
                        ? "900px"
                        : "650px",
                    height: "360px",
                    display: "block",
                    overflow: "visible",
                  }}
                  onMouseLeave={() =>
                    setHoveredPoint(null)
                  }
                >
                  {/* =========================================
                      GRADIENT
                  ========================================== */}

                  <defs>
                    <linearGradient
                      id="dailyRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity="0.30"
                      />

                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity="0.02"
                      />
                    </linearGradient>
                  </defs>

                  {/* =========================================
                      Y AXIS GRID
                  ========================================== */}

                  {yAxisValues.map(
                    (value, index) => {
                      const y =
                        paddingTop +
                        (index /
                          (yAxisValues.length -
                            1)) *
                          graphHeight;

                      return (
                        <g key={`y-${index}`}>
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={
                              chartWidth -
                              paddingRight
                            }
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />

                          <text
                            x={
                              paddingLeft - 12
                            }
                            y={y + 4}
                            textAnchor="end"
                            fill="#6b7280"
                            fontSize="12"
                          >
                            {money(value)}
                          </text>
                        </g>
                      );
                    }
                  )}

                  {/* =========================================
                      AREA
                  ========================================== */}

                  <path
                    d={areaPathD}
                    fill="url(#dailyRevenueGradient)"
                  />

                  {/* =========================================
                      LINE
                  ========================================== */}

                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* =========================================
                      X AXIS
                  ========================================== */}

                  <line
                    x1={paddingLeft}
                    y1={
                      paddingTop +
                      graphHeight
                    }
                    x2={
                      chartWidth -
                      paddingRight
                    }
                    y2={
                      paddingTop +
                      graphHeight
                    }
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />

                  {/* =========================================
                      POINTS
                  ========================================== */}

                  {chartPoints.map(
                    (point, index) => {
                      const isHovered =
                        hoveredPoint?.dateKey ===
                        point.dateKey;

                      /*
                       * For 30 days, don't show
                       * every single label.
                       */
                      const showLabel =
                        dateRange <= 14 ||
                        index === 0 ||
                        index ===
                          chartPoints.length - 1 ||
                        index % 5 === 0;

                      return (
                        <g
                          key={point.dateKey}
                          onMouseEnter={() =>
                            setHoveredPoint(
                              point
                            )
                          }
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          {/* Vertical guideline */}

                          {isHovered && (
                            <line
                              x1={point.x}
                              y1={
                                paddingTop
                              }
                              x2={point.x}
                              y2={
                                paddingTop +
                                graphHeight
                              }
                              stroke="#6366f1"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              opacity="0.5"
                            />
                          )}

                          {/* Invisible bigger hover area */}

                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="16"
                            fill="transparent"
                          />

                          {/* Point */}

                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={
                              isHovered
                                ? 7
                                : 4.5
                            }
                            fill="#fff"
                            stroke="#6366f1"
                            strokeWidth="3"
                          />

                          {/* Date label */}

                          {showLabel && (
                            <text
                              x={point.x}
                              y={
                                chartHeight -
                                17
                              }
                              textAnchor="middle"
                              fill="#6b7280"
                              fontSize="11"
                              fontWeight="500"
                            >
                              {point.period}
                            </text>
                          )}

                          {/* Value above point */}

                          {isHovered && (
                            <g>
                              <rect
                                x={
                                  point.x - 65
                                }
                                y={
                                  point.y -
                                  55
                                }
                                width="130"
                                height="42"
                                rx="8"
                                fill="#111827"
                              />

                              <text
                                x={point.x}
                                y={
                                  point.y -
                                  37
                                }
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="11"
                                fontWeight="500"
                              >
                                {point.period}
                              </text>

                              <text
                                x={point.x}
                                y={
                                  point.y -
                                  21
                                }
                                textAnchor="middle"
                                fill="#fff"
                                fontSize="13"
                                fontWeight="700"
                              >
                                {money(
                                  point.revenue
                                )}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    }
                  )}

                  {/* =========================================
                      EMPTY / ZERO MESSAGE
                  ========================================== */}

                  {dailyTimeline.every(
                    (item) =>
                      Number(
                        item.revenue || 0
                      ) === 0
                  ) && (
                    <text
                      x={
                        chartWidth / 2
                      }
                      y={
                        chartHeight / 2
                      }
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="14"
                    >
                      No earnings recorded
                      during this period
                    </text>
                  )}
                </svg>

                {/* ===========================================
                    HOVER DETAIL CARD
                ============================================ */}

                {hoveredPoint && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding:
                        "12px 16px",
                      borderRadius: "10px",
                      background:
                        "#f8fafc",
                      border:
                        "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#6b7280",
                          marginBottom:
                            "3px",
                        }}
                      >
                        Date
                      </small>

                      <strong>
                        {
                          hoveredPoint.fullDate
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                      }}
                    >
                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#6b7280",
                          marginBottom:
                            "3px",
                        }}
                      >
                        Daily Earnings
                      </small>

                      <strong
                        style={{
                          fontSize:
                            "18px",
                        }}
                      >
                        {money(
                          hoveredPoint.revenue
                        )}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              ORDER STATUS
          ================================================== */}

          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>
                  Fulfillment Distribution
                </h2>

                <p>
                  Status summary across all
                  store orders
                </p>
              </div>
            </div>

            <div
              className={styles.statusBarsList}
            >
              {statusBreakdown.length ===
              0 ? (
                <p
                  className={
                    styles.chartEmptyText
                  }
                >
                  No orders placed yet.
                </p>
              ) : (
                statusBreakdown.map(
                  (item) => {
                    const pct = Math.round(
                      (Number(
                        item.count || 0
                      ) /
                        totalStatusCount) *
                        100
                    );

                    const statusKey = (
                      item.status ||
                      "pending"
                    ).toLowerCase();

                    return (
                      <div
                        className={
                          styles.statusBarItem
                        }
                        key={statusKey}
                      >
                        <div
                          className={
                            styles.statusLabelRow
                          }
                        >
                          <span
                            className={`${styles.statusBadge} ${styles[statusKey]}`}
                          >
                            {item.status ||
                              "pending"}
                          </span>

                          <span
                            className={
                              styles.statusCount
                            }
                          >
                            <strong>
                              {
                                item.count
                              }{" "}
                              orders
                            </strong>{" "}
                            ({pct}%)
                          </span>
                        </div>

                        <div
                          className={
                            styles.statusTrack
                          }
                        >
                          <div
                            className={`${styles.statusFill} ${styles[statusKey]}`}
                            style={{
                              width: `${pct}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            {/* Category Summary */}

            <div
              className={
                styles.categorySummary
              }
            >
              <h3
                className={
                  styles.subheading
                }
              >
                Catalog by Category
              </h3>

              <div
                className={
                  styles.categoryWrap
                }
              >
                {(
                  analytics?.productsByCategory ||
                  []
                ).map((cat) => (
                  <span
                    className={
                      styles.catTag
                    }
                    key={cat.category}
                  >
                    {cat.category}:{" "}
                    <strong>
                      {cat.count}
                    </strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RECENT ORDERS
        ====================================================== */}

        <section className={styles.section}>
          <div
            className={
              styles.sectionHeading
            }
          >
            <div>
              <h2>
                Recent Customer Orders
              </h2>

              <p>
                Quickly inspect or update
                order shipping status
              </p>
            </div>

            <Link
              className={
                styles.secondaryBtn
              }
              to="/admin/orders"
            >
              View All Orders →
            </Link>
          </div>

          {recentOrders.length ===
          0 ? (
            <div
              className={
                styles.panelEmpty
              }
            >
              <p>
                No customer orders in
                database yet.
              </p>
            </div>
          ) : (
            <div
              className={
                styles.tableCard
              }
            >
              <table
                className={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th>
                      Order Reference
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Items
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Status Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map(
                    (order) => (
                      <tr
                        key={
                          order._id
                        }
                      >
                        <td>
                          <strong
                            className={
                              styles.orderId
                            }
                          >
                            #
                            {String(
                              order._id
                            ).slice(
                              -8
                            )}
                          </strong>
                        </td>

                        <td>
                          <div
                            className={
                              styles.customerBox
                            }
                          >
                            <strong
                              className={
                                styles.customerName
                              }
                            >
                              {order
                                .userId
                                ?.name ||
                                order
                                  .shippingDetails
                                  ?.fullName ||
                                "Customer"}
                            </strong>

                            <span
                              className={
                                styles.customerEmail
                              }
                            >
                              {order
                                .userId
                                ?.email ||
                                order
                                  .shippingDetails
                                  ?.email}
                            </span>
                          </div>
                        </td>

                        <td
                          className={
                            styles.dateCell
                          }
                        >
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          {order.items
                            ?.length ||
                            0}{" "}
                          item(s)
                        </td>

                        <td>
                          <strong
                            className={
                              styles.totalAmount
                            }
                          >
                            {money(
                              order.totalAmount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`${styles.paymentPill} ${
                              styles[
                                order
                                  .paymentStatus ||
                                  "unpaid"
                              ]
                            }`}
                          >
                            {order.paymentStatus ||
                              "unpaid"}
                          </span>
                        </td>

                        <td>
                          <select
                            className={
                              styles.statusSelect
                            }
                            value={
                              order.orderStatus ||
                              "pending"
                            }
                            disabled={
                              updatingId ===
                              order._id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                order._id,
                                e.target.value
                              )
                            }
                          >
                            {statuses.map(
                              (status) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {status
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase() +
                                    status.slice(
                                      1
                                    )}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    )
                  )}
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
