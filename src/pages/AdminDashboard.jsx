
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((amount || 0) / 100);

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

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // NEW: real daily earnings data
  const [dailyEarnings, setDailyEarnings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // NEW: selected graph range
  const [dateRange, setDateRange] = useState(7);

  // NEW: hovered graph point
  const [hoveredPoint, setHoveredPoint] = useState(null);

  /*
   * LOAD DASHBOARD DATA
   *
   * Existing APIs remain untouched.
   * Only daily earnings API has been added.
   */
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        overviewRes,
        analyticsRes,
        ordersRes,
        earningsRes,
      ] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminAnalytics(),
        authService.getAdminOrders(),

        // NEW
        authService.getAdminDailyEarnings(dateRange),
      ]);

      setStats(overviewRes?.stats || null);

      setAnalytics(
        analyticsRes?.analytics || null
      );

      setRecentOrders(
        (ordersRes?.orders || []).slice(0, 6)
      );

      // NEW
      setDailyEarnings(
        earningsRes?.earnings || []
      );

      setError("");
    } catch (err) {
      console.error(
        "Admin dashboard load error:",
        err
      );

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
  }, [navigate, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * UPDATE ORDER STATUS
   *
   * Existing functionality remains same.
   * Daily earnings is refreshed as well.
   */
  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    setUpdatingId(orderId);

    try {
      await authService.updateAdminOrderStatus(
        orderId,
        newStatus
      );

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

      const [
        overviewRes,
        analyticsRes,
        earningsRes,
      ] = await Promise.all([
        authService.getAdminOverview(),
        authService.getAdminAnalytics(),

        // NEW
        authService.getAdminDailyEarnings(
          dateRange
        ),
      ]);

      setStats(
        overviewRes?.stats || null
      );

      setAnalytics(
        analyticsRes?.analytics || null
      );

      // NEW
      setDailyEarnings(
        earningsRes?.earnings || []
      );
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
   * LOADING
   */
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>

          <p>
            Loading real-time admin metrics...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * DAILY EARNINGS
   * =====================================================
   *
   * Backend returns:
   *
   * [
   *   {
   *     date: "2026-09-02",
   *     total: 500,
   *     orderCount: 3
   *   }
   * ]
   *
   * total is already in dollars.
   */
  const timeline = useMemo(() => {
    return dailyEarnings.map((item) => {
      const date = new Date(
        `${item.date}T12:00:00`
      );

      return {
        period: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),

        date: item.date,

        fullDate: date.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        ),

        revenue: Number(
          item.total || 0
        ),

        orderCount: Number(
          item.orderCount || 0
        ),
      };
    });
  }, [dailyEarnings]);

  /*
   * Maximum revenue for graph scaling.
   */
  const maxRevenue = useMemo(() => {
    const highest = Math.max(
      ...timeline.map(
        (item) =>
          Number(item.revenue || 0)
      ),
      0
    );

    return Math.max(highest, 100);
  }, [timeline]);

  /*
   * Selected period total.
   */
  const totalDailyRevenue = useMemo(() => {
    return timeline.reduce(
      (sum, item) =>
        sum +
        Number(item.revenue || 0),
      0
    );
  }, [timeline]);

  /*
   * Total orders in selected period.
   */
  const totalDailyOrders = useMemo(() => {
    return timeline.reduce(
      (sum, item) =>
        sum +
        Number(item.orderCount || 0),
      0
    );
  }, [timeline]);

  /*
   * Existing status analytics.
   */
  const statusBreakdown =
    analytics?.statusBreakdown || [];

  const totalStatusCount =
    statusBreakdown.reduce(
      (sum, s) =>
        sum + Number(s.count || 0),
      0
    ) || 1;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* =========================
            HEADER
        ========================== */}

        <div className="dashboard-header">
          <div>
            <span className="dashboard-welcome">
              Store Control Center
            </span>

            <h1>
              Administrator Dashboard
            </h1>

            <p>
              Live metrics, revenue tracking,
              and order fulfillment
            </p>
          </div>

          <div className="dashboard-actions">
            <Link
              className="dashboard-view-btn"
              to="/admin/products/add"
            >
              + Add Product
            </Link>

            <button
              className="dashboard-outline-btn"
              onClick={loadData}
              title="Refresh data"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="dashboard-panel dashboard-error">
            {error}
          </div>
        )}

        {/* =========================
            LOW STOCK NOTIFICATION
        ========================== */}

        {stats?.lowStockCount > 0 && (
          <div className="admin-alert-banner warning">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>

              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              ></line>

              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              ></line>
            </svg>

            <div>
              <strong>
                Inventory Notice:
              </strong>{" "}
              {stats.lowStockCount} product(s)
              have 5 or fewer items remaining
              in stock.
            </div>

            <Link
              to="/admin/products"
              className="alert-action-link"
            >
              Review Stock
            </Link>
          </div>
        )}

        {/* =========================
            KPI CARDS
        ========================== */}

        <div className="admin-stats-grid">

          <div className="admin-stat-card primary">
            <div className="admin-stat-header">
              <span>
                Total Revenue
              </span>

              <span className="stat-icon">
                💰
              </span>
            </div>

            <strong>
              {money(
                stats?.totalEarnings
              )}
            </strong>

            <small>
              From verified checkouts
            </small>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span>
                Total Orders
              </span>

              <span className="stat-icon">
                📦
              </span>
            </div>

            <strong>
              {stats?.totalOrders ?? 0}
            </strong>

            <small>
              {stats?.pendingOrders ?? 0}{" "}
              pending fulfillment
            </small>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span>
                Completed Orders
              </span>

              <span className="stat-icon">
                ✅
              </span>
            </div>

            <strong>
              {stats?.completedOrders ?? 0}
            </strong>

            <small>
              Delivered successfully
            </small>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span>
                Total Products
              </span>

              <span className="stat-icon">
                🏷️
              </span>
            </div>

            <strong>
              {stats?.totalProducts ?? 0}
            </strong>

            <small>
              <Link to="/admin/products">
                Manage catalog
              </Link>
            </small>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span>
                Categories
              </span>

              <span className="stat-icon">
                📁
              </span>
            </div>

            <strong>
              {stats?.totalCategories ?? 0}
            </strong>

            <small>
              <Link to="/admin/categories">
                Manage groups
              </Link>
            </small>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-header">
              <span>
                Total Users
              </span>

              <span className="stat-icon">
                👥
              </span>
            </div>

            <strong>
              {stats?.totalUsers ?? 0}
            </strong>

            <small>
              <Link to="/admin/users">
                View customers
              </Link>
            </small>
          </div>
        </div>

        {/* =================================================
            DAILY EARNINGS / REVENUE OVER TIME
        ================================================== */}

        <div className="admin-charts-grid">

          <div className="dashboard-panel chart-panel">

            <div className="chart-header">
              <div>
                <h2>
                  Revenue Over Time
                </h2>

                <p>
                  Daily earnings aggregated
                  from paid order transactions
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <select
                  value={dateRange}
                  onChange={(e) => {
                    setHoveredPoint(null);

                    setDateRange(
                      Number(
                        e.target.value
                      )
                    );
                  }}
                  className="status-selector"
                >
                  {RANGE_OPTIONS.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>

                <span className="chart-badge">
                  Live MongoDB Data
                </span>
              </div>
            </div>

            {/* Selected period summary */}

            {timeline.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  marginBottom: "18px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <small>
                    Selected Period
                  </small>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "22px",
                    }}
                  >
                    $
                    {totalDailyRevenue.toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <small>
                    Orders
                  </small>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "22px",
                    }}
                  >
                    {totalDailyOrders}
                  </strong>
                </div>
              </div>
            )}

            {timeline.length === 0 ? (
              <div className="chart-empty">
                <p>
                  No paid transactions
                  recorded for the selected
                  period.
                </p>
              </div>
            ) : (
              <div className="chart-wrapper">

                <div className="svg-chart-container">

                  <svg
                    className="timeline-svg"
                    viewBox={`0 0 ${
                      timeline.length * 90 +
                      40
                    } 250`}
                    preserveAspectRatio="none"
                  >

                    {/* Grid lines */}

                    <line
                      x1="20"
                      y1="20"
                      x2={
                        timeline.length *
                          90 +
                        20
                      }
                      y2="20"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />

                    <line
                      x1="20"
                      y1="90"
                      x2={
                        timeline.length *
                          90 +
                        20
                      }
                      y2="90"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />

                    <line
                      x1="20"
                      y1="160"
                      x2={
                        timeline.length *
                          90 +
                        20
                      }
                      y2="160"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />

                    <line
                      x1="20"
                      y1="190"
                      x2={
                        timeline.length *
                          90 +
                        20
                      }
                      y2="190"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                    />

                    {/* Y Axis */}

                    <text
                      x="5"
                      y="24"
                      fontSize="10"
                      fill="#64748b"
                    >
                      $
                      {Math.round(
                        maxRevenue
                      )}
                    </text>

                    <text
                      x="5"
                      y="94"
                      fontSize="10"
                      fill="#64748b"
                    >
                      $
                      {Math.round(
                        maxRevenue *
                          0.66
                      )}
                    </text>

                    <text
                      x="5"
                      y="164"
                      fontSize="10"
                      fill="#64748b"
                    >
                      $
                      {Math.round(
                        maxRevenue *
                          0.33
                      )}
                    </text>

                    {/* Bars */}

                    {timeline.map(
                      (
                        item,
                        idx
                      ) => {
                        const revenue =
                          Number(
                            item.revenue ||
                              0
                          );

                        const barHeight =
                          revenue ===
                          0
                            ? 4
                            : Math.max(
                                (
                                  revenue /
                                  maxRevenue
                                ) *
                                  150,
                                6
                              );

                        const x =
                          40 +
                          idx *
                            90;

                        const y =
                          190 -
                          barHeight;

                        return (
                          <g
                            key={`${item.date}-${idx}`}
                            className="chart-bar-group"
                            onMouseEnter={() =>
                              setHoveredPoint(
                                idx
                              )
                            }
                            onMouseLeave={() =>
                              setHoveredPoint(
                                null
                              )
                            }
                          >
                            {/* Bar */}

                            <rect
                              x={x}
                              y={y}
                              width="42"
                              height={
                                barHeight
                              }
                              rx="4"
                              fill="#933e25"
                              className="chart-bar"
                              style={{
                                cursor:
                                  "pointer",
                              }}
                            />

                            {/* Revenue */}

                            <text
                              x={
                                x +
                                21
                              }
                              y={
                                y -
                                8
                              }
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill="#1e293b"
                            >
                              $
                              {revenue.toFixed(
                                2
                              )}
                            </text>

                            {/* Date */}

                            <text
                              x={
                                x +
                                21
                              }
                              y="208"
                              textAnchor="middle"
                              fontSize="11"
                              fill="#64748b"
                            >
                              {
                                item.period
                              }
                            </text>

                            {/* Hover tooltip */}

                            {hoveredPoint ===
                              idx && (
                              <g>
                                <rect
                                  x={
                                    x -
                                    30
                                  }
                                  y={
                                    Math.max(
                                      y -
                                        58,
                                      5
                                    )
                                  }
                                  width="102"
                                  height="45"
                                  rx="5"
                                  fill="#1e293b"
                                />

                                <text
                                  x={
                                    x +
                                    21
                                  }
                                  y={
                                    Math.max(
                                      y -
                                        38,
                                      25
                                    )
                                  }
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="600"
                                  fill="#ffffff"
                                >
                                  $
                                  {revenue.toFixed(
                                    2
                                  )}
                                </text>

                                <text
                                  x={
                                    x +
                                    21
                                  }
                                  y={
                                    Math.max(
                                      y -
                                        23,
                                      40
                                    )
                                  }
                                  textAnchor="middle"
                                  fontSize="9"
                                  fill="#ffffff"
                                >
                                  {
                                    item.orderCount
                                  }{" "}
                                  order
                                  {item.orderCount ===
                                  1
                                    ? ""
                                    : "s"}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      }
                    )}
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              ORDER STATUS DISTRIBUTION
          ================================================== */}

          <div className="dashboard-panel chart-panel">

            <div className="chart-header">
              <div>
                <h2>
                  Order Fulfillment Status
                </h2>

                <p>
                  Status breakdown of all
                  orders
                </p>
              </div>
            </div>

            <div className="status-bars-list">

              {statusBreakdown.length ===
              0 ? (
                <p className="chart-empty-text">
                  No orders placed yet.
                </p>
              ) : (
                statusBreakdown.map(
                  (item) => {
                    const pct =
                      Math.round(
                        (Number(
                          item.count ||
                            0
                        ) /
                          totalStatusCount) *
                          100
                      );

                    const statusKey =
                      (
                        item.status ||
                        "pending"
                      ).toLowerCase();

                    return (
                      <div
                        className="status-bar-item"
                        key={
                          statusKey
                        }
                      >

                        <div className="status-bar-label-row">

                          <span
                            className={`status-badge ${statusKey}`}
                          >
                            {item.status ||
                              "pending"}
                          </span>

                          <span className="status-count">
                            <strong>
                              {
                                item.count
                              }{" "}
                              orders
                            </strong>{" "}
                            ({pct}%)
                          </span>
                        </div>

                        <div className="status-progress-track">

                          <div
                            className={`status-progress-fill ${statusKey}`}
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

            {/* Quick Catalog categories summary */}

            <div className="category-distribution-summary">

              <h3 className="subheading">
                Products by Category
              </h3>

              <div className="category-tags-wrap">

                {(
                  analytics?.productsByCategory ||
                  []
                ).map((cat) => (
                  <span
                    className="cat-metric-tag"
                    key={
                      cat.category
                    }
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

        {/* =========================
            RECENT ORDERS TABLE
        ========================== */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <div>
              <h2>
                Recent Customer Orders
              </h2>

              <p>
                Quickly inspect or advance
                order shipping statuses
              </p>
            </div>

            <Link
              className="dashboard-view-btn"
              to="/admin/orders"
            >
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="dashboard-panel">
              <p>
                No customer orders in
                database yet.
              </p>
            </div>
          ) : (
            <div className="dashboard-panel order-table-wrap">

              <table className="dashboard-table">

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
                          <strong>
                            #
                            {String(
                              order._id
                            ).slice(
                              -8
                            )}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {order
                              .userId
                              ?.name ||
                              order
                                .shippingDetails
                                ?.fullName ||
                              "Customer"}
                          </strong>

                          <br />

                          <small className="text-muted">
                            {order
                              .userId
                              ?.email ||
                              order
                                .shippingDetails
                                ?.email}
                          </small>
                        </td>

                        <td>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          {order.items
                            ?.length ||
                            0}{" "}
                          product(s)
                        </td>

                        <td>
                          <strong>
                            {money(
                              order.totalAmount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`payment-pill ${
                              order.paymentStatus ||
                              "unpaid"
                            }`}
                          >
                            {order.paymentStatus ||
                              "unpaid"}
                          </span>
                        </td>

                        <td>

                          <select
                            className="status-selector"
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
                                e.target
                                  .value
                              )
                            }
                          >

                            {statuses.map(
                              (s) => (
                                <option
                                  key={s}
                                  value={s}
                                >
                                  {s}
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