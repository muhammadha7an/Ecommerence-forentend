 
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import styles from "../style/AdminDashboard.module.css";

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((Number(amount) || 0) / 100);

const moneyFromDollars = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

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

function formatDateLabel(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);

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

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(value))
  );

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

function formatStatus(status) {
  if (!status) return "Pending";

  return String(status)
    .charAt(0)
    .toUpperCase() + String(status).slice(1);
}

function getOrderCustomerName(order) {
  return (
    order?.userId?.name ||
    order?.shippingDetails?.fullName ||
    "Guest Customer"
  );
}

function getOrderCustomerEmail(order) {
  return (
    order?.userId?.email ||
    order?.shippingDetails?.email ||
    "No email"
  );
}

function getOrderTotal(order) {
  return Number(order?.totalAmount || 0);
}

function getOrderDate(order) {
  if (!order?.createdAt) return "—";

  const date = new Date(order.createdAt);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Real daily earnings data
  const [dailyEarnings, setDailyEarnings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [dateRange, setDateRange] = useState(7);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  /*
   * Load dashboard data
   *
   * Daily earnings are fetched separately because
   * /admin/analytics returns monthly timeline data.
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
        authService.getAdminDailyEarnings(dateRange),
      ]);

      setStats(overviewRes?.stats || null);

      setAnalytics(analyticsRes?.analytics || null);

      setRecentOrders(
        (ordersRes?.orders || []).slice(0, 6)
      );

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
   * Update order status
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
        authService.getAdminDailyEarnings(dateRange),
      ]);

      setStats(overviewRes?.stats || null);

      setAnalytics(
        analyticsRes?.analytics || null
      );

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
   * Convert backend daily earnings into chart data.
   *
   * Backend response:
   *
   * {
   *   date: "2026-09-02",
   *   total: 500,
   *   orderCount: 3
   * }
   *
   * So the chart revenue is already in dollars.
   */
  const dailyTimeline = useMemo(() => {
    if (!Array.isArray(dailyEarnings)) {
      return [];
    }

    return dailyEarnings.map((item) => {
      const dateKey = item?.date;

      return {
        dateKey,
        period: formatDateLabel(dateKey),
        fullDate: formatFullDate(dateKey),
        revenue: Number(item?.total || 0),
        orderCount: Number(
          item?.orderCount || 0
        ),
      };
    });
  }, [dailyEarnings]);

  /*
   * Chart dimensions
   */
  const chartWidth = 900;
  const chartHeight = 360;

  const paddingLeft = 70;
  const paddingRight = 25;
  const paddingTop = 45;
  const paddingBottom = 55;

  const graphWidth =
    chartWidth -
    paddingLeft -
    paddingRight;

  const graphHeight =
    chartHeight -
    paddingTop -
    paddingBottom;

  /*
   * Maximum Y-axis value
   */
  const maxRevenue = useMemo(() => {
    const highest = Math.max(
      ...dailyTimeline.map((item) =>
        Number(item.revenue || 0)
      ),
      0
    );

    return getNiceMax(highest);
  }, [dailyTimeline]);

  /*
   * Y-axis values
   */
  const yAxisValues = useMemo(() => {
    const steps = 5;

    return Array.from(
      { length: steps + 1 },
      (_, index) => {
        return (
          (maxRevenue / steps) * index
        );
      }
    ).reverse();
  }, [maxRevenue]);

  /*
   * Calculate SVG chart points
   */
  const chartPoints = useMemo(() => {
    if (!dailyTimeline.length) {
      return [];
    }

    return dailyTimeline.map(
      (item, index) => {
        const denominator = Math.max(
          dailyTimeline.length - 1,
          1
        );

        const x =
          paddingLeft +
          (index / denominator) *
            graphWidth;

        const revenue = Number(
          item.revenue || 0
        );

        const y =
          paddingTop +
          graphHeight -
          (revenue / maxRevenue) *
            graphHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );
  }, [
    dailyTimeline,
    graphWidth,
    graphHeight,
    maxRevenue,
  ]);

  /*
   * SVG line path
   */
  const linePathD = useMemo(() => {
    if (!chartPoints.length) {
      return "";
    }

    return chartPoints
      .map(
        (point, index) =>
          `${
            index === 0 ? "M" : "L"
          } ${point.x} ${point.y}`
      )
      .join(" ");
  }, [chartPoints]);

  /*
   * SVG area path
   */
  const areaPathD = useMemo(() => {
    if (!chartPoints.length) {
      return "";
    }

    const firstPoint =
      chartPoints[0];

    const lastPoint =
      chartPoints[
        chartPoints.length - 1
      ];

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

  /*
   * Total earnings for selected period
   */
  const totalDailyRevenue = useMemo(() => {
    return dailyTimeline.reduce(
      (sum, item) =>
        sum +
        Number(item.revenue || 0),
      0
    );
  }, [dailyTimeline]);

  /*
   * Status breakdown
   */
  const statusBreakdown =
    analytics?.statusBreakdown || [];

  const totalStatusCount =
    statusBreakdown.reduce(
      (sum, item) =>
        sum + Number(item.count || 0),
      0
    ) || 1;

  /*
   * Category breakdown
   */
  const productsByCategory =
    analytics?.productsByCategory || [];

  /*
   * Loading state
   */
  if (loading && !stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div
            className={styles.loadingSpinner}
          />
          <p>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* ================================
          HEADER
      ================================= */}

      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <Link to="/admin">
              Admin
            </Link>

            <span>/</span>

            <span>Dashboard</span>
          </div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor your store performance,
            orders, products and customers.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={loadData}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <Link
            to="/admin/products/new"
            className={styles.primaryButton}
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* ================================
          ERROR
      ================================= */}

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>

          <button
            type="button"
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================
          LOW STOCK
      ================================= */}

      {Number(
        stats?.lowStockCount || 0
      ) > 0 && (
        <div className={styles.warningBanner}>
          <div>
            <strong>
              Low stock alert
            </strong>

            <p>
              {
                stats.lowStockCount
              }{" "}
              product
              {Number(
                stats.lowStockCount
              ) === 1
                ? ""
                : "s"}{" "}
              have 5 or fewer items
              remaining.
            </p>
          </div>

          <Link
            to="/admin/products"
            className={
              styles.warningButton
            }
          >
            View Products
          </Link>
        </div>
      )}

      {/* ================================
          KPI CARDS
      ================================= */}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Total Revenue
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              $
            </span>
          </div>

          <strong className={styles.statValue}>
            {money(
              stats?.totalEarnings || 0
            )}
          </strong>

          <span className={styles.statHint}>
            Paid orders
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Total Orders
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              #
            </span>
          </div>

          <strong className={styles.statValue}>
            {Number(
              stats?.totalOrders || 0
            ).toLocaleString()}
          </strong>

          <span className={styles.statHint}>
            All orders
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Completed Orders
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              ✓
            </span>
          </div>

          <strong className={styles.statValue}>
            {Number(
              stats?.completedOrders || 0
            ).toLocaleString()}
          </strong>

          <span className={styles.statHint}>
            Delivered orders
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Total Products
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              P
            </span>
          </div>

          <strong className={styles.statValue}>
            {Number(
              stats?.totalProducts || 0
            ).toLocaleString()}
          </strong>

          <span className={styles.statHint}>
            Products in catalog
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Categories
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              C
            </span>
          </div>

          <strong className={styles.statValue}>
            {Number(
              stats?.totalCategories || 0
            ).toLocaleString()}
          </strong>

          <span className={styles.statHint}>
            Active categories
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statLabel}>
              Total Users
            </span>

            <span
              className={
                styles.statIcon
              }
            >
              U
            </span>
          </div>

          <strong className={styles.statValue}>
            {Number(
              stats?.totalUsers || 0
            ).toLocaleString()}
          </strong>

          <span className={styles.statHint}>
            Registered customers
          </span>
        </div>
      </div>

      {/* ================================
          DAILY EARNINGS
      ================================= */}

      <section
        className={styles.dashboardCard}
      >
        <div
          className={
            styles.dashboardCardHeader
          }
        >
          <div>
            <h2>
              Daily Earnings
            </h2>

            <p>
              Revenue generated from paid
              orders by day.
            </p>
          </div>

          <select
            value={dateRange}
            onChange={(event) =>
              setDateRange(
                Number(event.target.value)
              )
            }
            className={
              styles.rangeSelect
            }
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

        <div
          className={
            styles.chartSummary
          }
        >
          <div>
            <span>
              Selected Period
            </span>

            <strong>
              {moneyFromDollars(
                totalDailyRevenue
              )}
            </strong>
          </div>

          <div>
            <span>
              Days
            </span>

            <strong>
              {dailyTimeline.length}
            </strong>
          </div>

          <div>
            <span>
              Orders
            </span>

            <strong>
              {dailyTimeline.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.orderCount || 0
                  ),
                0
              )}
            </strong>
          </div>
        </div>

        <div
          className={
            styles.chartWrapper
          }
        >
          {dailyTimeline.length > 0 ? (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className={
                styles.earningsChart
              }
              preserveAspectRatio="none"
            >
              {/* Y-axis labels + grid */}
              {yAxisValues.map(
                (value, index) => {
                  const y =
                    paddingTop +
                    (index /
                      5) *
                      graphHeight;

                  return (
                    <g
                      key={`y-${index}`}
                    >
                      <line
                        x1={paddingLeft}
                        x2={
                          chartWidth -
                          paddingRight
                        }
                        y1={y}
                        y2={y}
                        className={
                          styles.chartGridLine
                        }
                      />

                      <text
                        x={
                          paddingLeft -
                          12
                        }
                        y={y + 4}
                        textAnchor="end"
                        className={
                          styles.chartAxisText
                        }
                      >
                        $
                        {Math.round(
                          value
                        ).toLocaleString()}
                      </text>
                    </g>
                  );
                }
              )}

              {/* Area */}
              {areaPathD && (
                <path
                  d={areaPathD}
                  className={
                    styles.chartArea
                  }
                />
              )}

              {/* Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  className={
                    styles.chartLine
                  }
                />
              )}

              {/* Points */}
              {chartPoints.map(
                (point, index) => (
                  <g
                    key={`${point.dateKey}-${index}`}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={
                        hoveredPoint ===
                        index
                          ? 7
                          : 4
                      }
                      className={
                        styles.chartPoint
                      }
                      onMouseEnter={() =>
                        setHoveredPoint(
                          index
                        )
                      }
                      onMouseLeave={() =>
                        setHoveredPoint(
                          null
                        )
                      }
                    />

                    {/* X-axis labels */}
                    {(dateRange <= 7 ||
                      index === 0 ||
                      index ===
                        chartPoints.length -
                          1 ||
                      index %
                        Math.ceil(
                          chartPoints.length /
                            6
                        ) ===
                        0) && (
                      <text
                        x={point.x}
                        y={
                          chartHeight -
                          18
                        }
                        textAnchor="middle"
                        className={
                          styles.chartAxisText
                        }
                      >
                        {point.period}
                      </text>
                    )}
                  </g>
                )
              )}

              {/* Hover vertical line */}
              {hoveredPoint !==
                null &&
                chartPoints[
                  hoveredPoint
                ] && (
                  <line
                    x1={
                      chartPoints[
                        hoveredPoint
                      ].x
                    }
                    x2={
                      chartPoints[
                        hoveredPoint
                      ].x
                    }
                    y1={paddingTop}
                    y2={
                      paddingTop +
                      graphHeight
                    }
                    className={
                      styles.chartHoverLine
                    }
                  />
                )}
            </svg>
          ) : (
            <div
              className={
                styles.emptyChart
              }
            >
              <strong>
                No earnings data
              </strong>

              <p>
                There are no paid orders
                for the selected period.
              </p>
            </div>
          )}

          {/* Tooltip */}
          {hoveredPoint !==
            null &&
            chartPoints[
              hoveredPoint
            ] && (
              <div
                className={
                  styles.chartTooltip
                }
              >
                <strong>
                  {
                    chartPoints[
                      hoveredPoint
                    ].fullDate
                  }
                </strong>

                <span>
                  Earnings:{" "}
                  {moneyFromDollars(
                    chartPoints[
                      hoveredPoint
                    ].revenue
                  )}
                </span>

                <span>
                  Orders:{" "}
                  {
                    chartPoints[
                      hoveredPoint
                    ].orderCount
                  }
                </span>
              </div>
            )}
        </div>
      </section>

      {/* ================================
          TWO COLUMN ANALYTICS
      ================================= */}

      <div
        className={
          styles.analyticsGrid
        }
      >
        {/* Fulfillment Distribution */}
        <section
          className={
            styles.dashboardCard
          }
        >
          <div
            className={
              styles.dashboardCardHeader
            }
          >
            <div>
              <h2>
                Fulfillment Distribution
              </h2>

              <p>
                Orders grouped by current
                status.
              </p>
            </div>
          </div>

          {statusBreakdown.length >
          0 ? (
            <div
              className={
                styles.statusList
              }
            >
              {statusBreakdown.map(
                (item) => {
                  const count =
                    Number(
                      item.count || 0
                    );

                  const percentage =
                    (count /
                      totalStatusCount) *
                    100;

                  return (
                    <div
                      key={
                        item.status
                      }
                      className={
                        styles.statusRow
                      }
                    >
                      <div
                        className={
                          styles.statusRowTop
                        }
                      >
                        <span>
                          {formatStatus(
                            item.status
                          )}
                        </span>

                        <strong>
                          {count}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.progressTrack
                        }
                      >
                        <div
                          className={
                            styles.progressBar
                          }
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span
                        className={
                          styles.statusPercentage
                        }
                      >
                        {percentage.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div
              className={
                styles.emptyState
              }
            >
              No order status data
              available.
            </div>
          )}
        </section>

        {/* Catalog by Category */}
        <section
          className={
            styles.dashboardCard
          }
        >
          <div
            className={
              styles.dashboardCardHeader
            }
          >
            <div>
              <h2>
                Catalog by Category
              </h2>

              <p>
                Products currently
                assigned to each category.
              </p>
            </div>
          </div>

          {productsByCategory.length >
          0 ? (
            <div
              className={
                styles.categoryList
              }
            >
              {productsByCategory
                .slice(0, 8)
                .map((item) => (
                  <div
                    key={
                      item.category
                    }
                    className={
                      styles.categoryRow
                    }
                  >
                    <div>
                      <strong>
                        {item.category ||
                          "Uncategorized"}
                      </strong>

                      <span>
                        Products
                      </span>
                    </div>

                    <strong>
                      {Number(
                        item.count || 0
                      )}
                    </strong>
                  </div>
                ))}
            </div>
          ) : (
            <div
              className={
                styles.emptyState
              }
            >
              No category data
              available.
            </div>
          )}
        </section>
      </div>

      {/* ================================
          RECENT ORDERS
      ================================= */}

      <section
        className={styles.dashboardCard}
      >
        <div
          className={
            styles.dashboardCardHeader
          }
        >
          <div>
            <h2>
              Recent Customer Orders
            </h2>

            <p>
              Latest orders from your
              customers.
            </p>
          </div>

          <Link
            to="/admin/orders"
            className={
              styles.viewAllLink
            }
          >
            View All Orders →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={
                styles.ordersTable
              }
            >
              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
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
                        <Link
                          to={`/admin/orders/${order._id}`}
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
                        </Link>
                      </td>

                      <td>
                        <div
                          className={
                            styles.customerCell
                          }
                        >
                          <strong>
                            {getOrderCustomerName(
                              order
                            )}
                          </strong>

                          <span>
                            {getOrderCustomerEmail(
                              order
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        {getOrderDate(
                          order
                        )}
                      </td>

                      <td>
                        <strong>
                          {money(
                            getOrderTotal(
                              order
                            )
                          )}
                        </strong>
                      </td>

                      <td>
                        <select
                          value={
                            order.orderStatus ||
                            "pending"
                          }
                          onChange={(
                            event
                          ) =>
                            handleStatusChange(
                              order._id,
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          className={
                            styles.statusSelect
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
                                {formatStatus(
                                  status
                                )}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className={
                            styles.viewOrderButton
                          }
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={
              styles.emptyState
            }
          >
            <strong>
              No orders yet
            </strong>

            <p>
              Customer orders will appear
              here once they are placed.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

