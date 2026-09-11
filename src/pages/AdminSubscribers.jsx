import { useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const sourceLabels = {
  home: "Homepage",
  footer: "Footer",
  website: "Website",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadedAt, setLoadedAt] = useState(0);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authService.getAdminSubscribers();
      setSubscribers(Array.isArray(data?.subscribers) ? data.subscribers : []);
      setLoadedAt(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load newsletter subscribers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const filteredSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return subscribers;
    return subscribers.filter((subscriber) =>
      String(subscriber.email || "").toLowerCase().includes(term)
    );
  }, [subscribers, search]);

  const stats = useMemo(() => {
    const monthAgo = loadedAt - 30 * 24 * 60 * 60 * 1000;
    return {
      total: subscribers.length,
      active: subscribers.filter((s) => (s.status || "active") === "active").length,
      recent: subscribers.filter((s) => new Date(s.createdAt).getTime() >= monthAgo).length,
    };
  }, [subscribers, loadedAt]);

  const copyEmails = async () => {
    const list = filteredSubscribers
      .filter((s) => (s.status || "active") === "active")
      .map((s) => s.email)
      .join(", ");
    if (!list) return;

    try {
      await navigator.clipboard.writeText(list);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard access is blocked in this browser.");
    }
  };

  return (
    <div className="console-page">
      {/* Header */}
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Marketing</span>
          <h1>
            Newsletter subscribers <span className="console-count">{subscribers.length}</span>
          </h1>
          <p>Everyone who joined the newsletter from the homepage or footer, newest first.</p>
        </div>

        <div className="console-head__actions">
          <button type="button" className="ui-btn ui-btn--secondary" onClick={loadSubscribers}>
            <Icon name="refresh" />
            Refresh
          </button>
          <button
            type="button"
            className="ui-btn"
            onClick={copyEmails}
            disabled={filteredSubscribers.length === 0}
          >
            <Icon name={copied ? "check" : "copy"} />
            {copied ? "Copied" : "Copy Emails"}
          </button>
        </div>
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="console-stats console-stats--3">
        <div className="console-stat console-stat--feature">
          <div className="console-stat__top">
            <span>Total subscribers</span>
            <span className="console-stat__icon"><Icon name="mail" /></span>
          </div>
          <strong className="console-stat__value">{stats.total}</strong>
          <small className="console-stat__meta">All-time sign-ups</small>
        </div>
        <div className="console-stat">
          <div className="console-stat__top">
            <span>Active</span>
            <span className="console-stat__icon console-stat__icon--success"><Icon name="mailCheck" /></span>
          </div>
          <strong className="console-stat__value">{stats.active}</strong>
          <small className="console-stat__meta">Receiving emails</small>
        </div>
        <div className="console-stat">
          <div className="console-stat__top">
            <span>Last 30 days</span>
            <span className="console-stat__icon console-stat__icon--clay"><Icon name="trendingUp" /></span>
          </div>
          <strong className="console-stat__value">{stats.recent}</strong>
          <small className="console-stat__meta">New subscribers</small>
        </div>
      </div>

      {/* Search */}
      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search subscribers</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search by email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="console-toolbar__spacer" />
        {!loading && (
          <span className="console-toolbar__meta">
            {filteredSubscribers.length} of {subscribers.length} shown
          </span>
        )}
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true"></span>
            <p>Loading subscribers...</p>
          </div>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <EmptyState
          icon="mail"
          title={subscribers.length === 0 ? "No subscribers yet" : "No matching subscribers"}
          text={
            subscribers.length === 0
              ? "New sign-ups from the homepage and footer newsletter forms will appear here."
              : "Try a different email search."
          }
        />
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack">
              <thead>
                <tr>
                  <th>Email address</th>
                  <th>Subscribed on</th>
                  <th>Source</th>
                  <th className="is-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber._id || subscriber.email}>
                    <td className="is-primary" data-label="Email">
                      <div className="admin-subscriber-email">
                        <span className="console-avatar console-avatar--sm">
                          {String(subscriber.email || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="console-cell__stack">
                          <strong>{subscriber.email}</strong>
                        </div>
                      </div>
                    </td>
                    <td data-label="Subscribed on">
                      <div className="console-cell__stack">
                        <span>{formatDate(subscriber.createdAt)}</span>
                        <span className="console-muted">{formatTime(subscriber.createdAt)}</span>
                      </div>
                    </td>
                    <td data-label="Source">
                      {sourceLabels[subscriber.source] || subscriber.source || "Website"}
                    </td>
                    <td data-label="Status" className="is-right">
                      <StatusBadge status={subscriber.status || "active"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSubscribers;
