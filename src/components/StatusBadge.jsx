/*
 * StatusBadge — one consistent badge for order + payment + stock statuses.
 * Only the colour tone is derived from the value; the text stays as-is.
 */
const toneByStatus = {
  // order statuses
  pending: "warning",
  processing: "info",
  shipped: "clay",
  delivered: "success",
  completed: "success",
  complete: "success",
  cancelled: "danger",
  canceled: "danger",
  open: "info",
  expired: "danger",
  // payment statuses
  paid: "success",
  unpaid: "warning",
  no_payment_required: "neutral",
  refunded: "neutral",
  failed: "danger",
  // generic
  active: "success",
  unsubscribed: "neutral",
  "in stock": "success",
  "out of stock": "danger",
  "low stock": "warning",
  admin: "ink",
  user: "sage",
};

function StatusBadge({ status, label, tone, className = "" }) {
  const value = String(status || "pending").toLowerCase();
  const resolvedTone = tone || toneByStatus[value] || "neutral";
  const toneClass = resolvedTone === "neutral" ? "" : `ui-badge--${resolvedTone}`;

  return (
    <span className={`ui-badge ui-badge--dot ${toneClass} ${className}`.trim()}>
      {label || String(status || "pending").replace(/_/g, " ")}
    </span>
  );
}

export default StatusBadge;
