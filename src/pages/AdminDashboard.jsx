
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";


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
  const [actionError, setActionError] = useState("");

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
    setActionError("");

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
      setActionError(
        err.response?.data?.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

  /*
   * CHART GEOMETRY (responsive SVG, real data only)
   */
  const chart = (() => {
    const width = 720;
    const height = 260;
    const left = 48;
    const right = 8;
    const top = 16;
    const bottom = 30;
    const plotH = height - top - bottom;
    const count = Math.max(timeline.length, 1);
    const slot = (width - left - right) / count;
    const barW = Math.min(44, slot * 0.62);
    const labelEvery = count > 14 ? 3 : count > 7 ? 2 : 1;

    const bars = timeline.map((item, idx) => {
      const revenue = Number(item.revenue || 0);
      const barH = revenue === 0 ? 3 : Math.max((revenue / maxRevenue) * plotH, 6);
      const x = left + idx * slot + (slot - barW) / 2;
      const y = top + plotH - barH;
      return { ...item, revenue, x, y, barH, cx: x + barW / 2 };
    });

    const ticks = [1, 0.66, 0.33, 0].map((ratio) => ({
      value: Math.round(maxRevenue * ratio),
      y: top + plotH - plotH * ratio,
    }));

    return { width, height, left, right, top, plotH, barW, bars, ticks, labelEvery, showValues: count <= 7 };
  })();

  const hovered = hoveredPoint !== null ? chart.bars[hoveredPoint] : null;

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="console-page">
        <div className="ui-loading">
          <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
          <p>Loading real-time admin metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total revenue",
      value: money(stats?.totalEarnings),
      meta: "From verified checkouts",
      icon: "dollar",
      feature: true,
    },
    {
      label: "Total orders",
      value: stats?.totalOrders ?? 0,
      meta: `${stats?.pendingOrders ?? 0} pending fulfillment`,
      icon: "package",
      tone: "info",
      to: "/admin/orders",
    },
    {
      label: "Completed orders",
      value: stats?.completedOrders ?? 0,
      meta: "Delivered to customers",
      icon: "checkCircle",
      tone: "success",
    },
    {
      label: "Total users",
      value: stats?.totalUsers ?? 0,
      meta: "Registered accounts",
      icon: "users",
      to: "/admin/users",
    },
    {
      label: "Total products",
      value: stats?.totalProducts ?? 0,
      meta: "Live in the catalog",
      icon: "tag",
      tone: "clay",
      to: "/admin/products",
    },
    {
      label: "Categories",
      value: stats?.totalCategories ?? 0,
      meta: "Storefront groupings",
      icon: "folder",
      to: "/admin/categories",
    },
    {
      label: "Low stock",
      value: stats?.lowStockCount ?? 0,
      meta: "Products with 5 or fewer units",
      icon: "alertTriangle",
      tone: "warning",
      to: "/admin/products",
    },
    {
      label: "Subscribers",
      value: stats?.totalSubscribers ?? 0,
      meta: "Newsletter sign-ups",
      icon: "mail",
      tone: "clay",
      to: "/admin/subscribers",
    },
    {
      label: "Unread messages",
      value: stats?.unreadContactMessages ?? 0,
      meta: "From the contact form",
      icon: "inbox",
      tone: "info",
      to: "/admin/contact-messages",
    },
    {
      label: "Out of stock",
      value: stats?.outOfStockCount ?? 0,
      meta: "Cannot be purchased",
      icon: "package",
      tone: "warning",
      to: "/admin/products",
    },
  ];

  return (
    <div className="console-page">
      {/* HEADER */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Store control center</span>
          <h1>Administrator dashboard</h1>
          <p>Live metrics, revenue tracking and order fulfillment.</p>
        </div>

        <div className="console-head__actions">
          <button
            type="button"
            className="ui-btn ui-btn--secondary"
            onClick={loadData}
            title="Refresh data"
          >
            <Icon name="refresh" />
            Refresh
          </button>
          <Link className="ui-btn" to="/admin/products/add">
            <Icon name="plus" />
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}

      {actionError && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{actionError}</span>
        </div>
      )}

      {/* LOW STOCK NOTICE */}
      {stats?.lowStockCount > 0 && (
        <div className="console-banner" role="status">
          <Icon name="alertTriangle" />
          <div className="console-banner__text">
            <strong>Inventory notice:</strong> {stats.lowStockCount} product(s) have 5 or fewer items remaining in stock.
          </div>
          <Link to="/admin/products" className="ui-btn ui-btn--secondary ui-btn--sm">
            Review Stock
          </Link>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="console-stats console-stats--kpis">
        {kpis.map((kpi) => {
          const Wrapper = kpi.to ? Link : "div";
          const wrapperProps = kpi.to ? { to: kpi.to } : {};
          return (
            <Wrapper
              key={kpi.label}
              className={`console-stat ${kpi.feature ? "console-stat--feature" : ""}`}
              {...wrapperProps}
            >
              <div className="console-stat__top">
                <span>{kpi.label}</span>
                <span className={`console-stat__icon ${kpi.tone ? `console-stat__icon--${kpi.tone}` : ""}`}>
                  <Icon name={kpi.icon} />
                </span>
              </div>
              <strong className="console-stat__value">{kpi.value}</strong>
              <small className="console-stat__meta">{kpi.meta}</small>
            </Wrapper>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="console-charts">
        {/* Revenue over time */}
        <section className="console-panel">
          <div className="console-panel__head">
            <div>
              <h2>Revenue over time</h2>
              <p>Daily earnings aggregated from paid orders</p>
            </div>

            <select
              value={dateRange}
              onChange={(e) => {
                setHoveredPoint(null);
                setDateRange(Number(e.target.value));
              }}
              className="ui-select ui-select--sm"
              style={{ width: "auto" }}
              aria-label="Revenue period"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="console-panel__body">
            {timeline.length > 0 && (
              <div className="console-chart-summary">
                <div>
                  <span>Selected period</span>
                  <strong>${totalDailyRevenue.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Paid orders</span>
                  <strong>{totalDailyOrders}</strong>
                </div>
                <div>
                  <span>Daily average</span>
                  <strong>${(totalDailyRevenue / Math.max(timeline.length, 1)).toFixed(2)}</strong>
                </div>
              </div>
            )}

            {timeline.length === 0 ? (
              <EmptyState
                icon="trendingUp"
                title="No revenue yet"
                text="No paid transactions recorded for the selected period."
              />
            ) : (
              <div className="console-bar-chart" onMouseLeave={() => setHoveredPoint(null)}>
                <svg
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  role="img"
                  aria-label={`Daily revenue for the last ${dateRange} days`}
                >
                  {chart.ticks.map((tick) => (
                    <g key={tick.y}>
                      <line
                        x1={chart.left}
                        x2={chart.width - chart.right}
                        y1={tick.y}
                        y2={tick.y}
                        stroke={tick.value === 0 ? "#cfd4cb" : "#eef1ea"}
                        strokeWidth="1"
                      />
                      <text x={chart.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#87918d">
                        ${tick.value}
                      </text>
                    </g>
                  ))}

                  {chart.bars.map((bar, idx) => (
                    <g
                      key={`${bar.date}-${idx}`}
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onFocus={() => setHoveredPoint(idx)}
                      onBlur={() => setHoveredPoint(null)}
                      tabIndex={0}
                      aria-label={`${bar.fullDate}: $${bar.revenue.toFixed(2)}, ${bar.orderCount} orders`}
                    >
                      <rect
                        x={bar.x - 4}
                        y={chart.top}
                        width={chart.barW + 8}
                        height={chart.plotH}
                        fill="transparent"
                      />
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={chart.barW}
                        height={bar.barH}
                        rx="4"
                        className={`console-bar-chart__bar ${bar.revenue > 0 ? "has-value" : ""} ${hoveredPoint === idx ? "is-hover" : ""}`}
                      />
                      {chart.showValues && bar.revenue > 0 && (
                        <text x={bar.cx} y={bar.y - 7} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1f2a27">
                          ${bar.revenue.toFixed(0)}
                        </text>
                      )}
                      {idx % chart.labelEvery === 0 && (
                        <text x={bar.cx} y={chart.height - 8} textAnchor="middle" fontSize="11" fill="#87918d">
                          {bar.period}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {hovered && (
                  <div
                    className="console-bar-chart__tooltip"
                    style={{
                      left: `${(hovered.cx / chart.width) * 100}%`,
                      top: `${(hovered.y / chart.height) * 100}%`,
                    }}
                  >
                    <strong>${hovered.revenue.toFixed(2)}</strong>
                    {hovered.orderCount} order{hovered.orderCount === 1 ? "" : "s"} on {hovered.period}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Fulfillment status */}
        <section className="console-panel">
          <div className="console-panel__head">
            <div>
              <h2>Order fulfillment</h2>
              <p>Status breakdown of all orders</p>
            </div>
          </div>

          <div className="console-panel__body">
            <div className="console-meter-list">
              {statusBreakdown.length === 0 ? (
                <p className="console-muted">No orders placed yet.</p>
              ) : (
                statusBreakdown.map((item) => {
                  const pct = Math.round((Number(item.count || 0) / totalStatusCount) * 100);
                  const statusKey = (item.status || "pending").toLowerCase();

                  return (
                    <div className="console-meter" key={statusKey}>
                      <div className="console-meter__row">
                        <StatusBadge status={item.status || "pending"} />
                        <span>
                          <strong>{item.count}</strong> orders ({pct}%)
                        </span>
                      </div>
                      <div className="console-meter__track">
                        <div
                          className={`console-meter__fill console-meter__fill--${statusKey}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <h3 className="console-subhead">Products by category</h3>
            <div className="console-chips">
              {(analytics?.productsByCategory || []).length === 0 ? (
                <span className="console-muted">No products yet.</span>
              ) : (
                (analytics?.productsByCategory || []).map((cat) => (
                  <span className="console-chip" key={cat.category}>
                    {cat.category} <strong>{cat.count}</strong>
                  </span>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* RECENT ORDERS */}
      <section className="console-panel">
        <div className="console-panel__head">
          <div>
            <h2>Recent customer orders</h2>
            <p>Inspect or advance order shipping statuses</p>
          </div>

          <Link className="ui-btn ui-btn--secondary ui-btn--sm" to="/admin/orders">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="console-panel__body">
            <EmptyState icon="package" title="No orders yet" text="No customer orders in the database yet." />
          </div>
        ) : (
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th className="is-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="is-primary" data-label="Order">
                      <span className="console-mono">#{String(order._id).slice(-8).toUpperCase()}</span>
                    </td>
                    <td data-label="Customer">
                      <div className="console-cell__stack">
                        <strong>{order.userId?.name || order.shippingDetails?.fullName || "Customer"}</strong>
                        <span className="console-muted">{order.userId?.email || order.shippingDetails?.email}</span>
                      </div>
                    </td>
                    <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td data-label="Items">{order.items?.length || 0} product(s)</td>
                    <td data-label="Total" className="is-num">
                      <strong>{money(order.totalAmount)}</strong>
                    </td>
                    <td data-label="Payment">
                      <StatusBadge status={order.paymentStatus || "unpaid"} />
                    </td>
                    <td data-label="Status" className="is-right">
                      <select
                        className="ui-select ui-select--sm console-status-select"
                        value={order.orderStatus || "pending"}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        aria-label={`Change status for order ${String(order._id).slice(-8)}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
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
  );
}

export default AdminDashboard;
