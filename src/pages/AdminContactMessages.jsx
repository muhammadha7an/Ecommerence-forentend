import { useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_LABELS = { new: "Unread", read: "Read", resolved: "Resolved" };
const STATUS_TONES = { new: "warning", read: "info", resolved: "success" };

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const preview = (text, length = 90) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};

function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({ total: 0, new: 0, read: 0, resolved: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authService.getAdminContactMessages();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setSummary(data.summary || { total: 0, new: 0, read: 0, resolved: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((message) => {
      if (statusFilter !== "all" && message.status !== statusFilter) return false;
      if (!term) return true;
      return [message.name, message.email, message.subject, message.message]
        .some((field) => String(field || "").toLowerCase().includes(term));
    });
  }, [messages, statusFilter, search]);

  const applyUpdate = (updated) => {
    setMessages((prev) => {
      const previous = prev.find((m) => m._id === updated._id);
      if (previous && previous.status !== updated.status) {
        setSummary((current) => ({
          ...current,
          [previous.status]: Math.max(0, (current[previous.status] || 0) - 1),
          [updated.status]: (current[updated.status] || 0) + 1,
        }));
      }
      return prev.map((m) => (m._id === updated._id ? updated : m));
    });
    setSelected((current) => (current && current._id === updated._id ? updated : current));
  };

  const changeStatus = async (message, status) => {
    if (!message || message.status === status) return;
    setBusyId(message._id);
    setActionError("");
    try {
      const data = await authService.updateContactMessageStatus(message._id, status);
      applyUpdate(data.contactMessage);
    } catch (err) {
      setActionError(err.response?.data?.message || "Unable to update the message.");
    } finally {
      setBusyId(null);
    }
  };

  // Opening an unread message marks it as read.
  const openMessage = (message) => {
    setActionError("");
    setConfirmDelete(false);
    setSelected(message);
    if (message.status === "new") changeStatus(message, "read");
  };

  const removeMessage = async () => {
    if (!selected) return;
    setBusyId(selected._id);
    setActionError("");
    try {
      await authService.deleteContactMessage(selected._id);
      setMessages((prev) => prev.filter((m) => m._id !== selected._id));
      setSummary((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        [selected.status]: Math.max(0, (current[selected.status] || 0) - 1),
      }));
      setSelected(null);
    } catch (err) {
      setActionError(err.response?.data?.message || "Unable to delete the message.");
    } finally {
      setBusyId(null);
      setConfirmDelete(false);
    }
  };

  const counts = { all: summary.total, new: summary.new, read: summary.read, resolved: summary.resolved };

  return (
    <div className="console-page">
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Customer support</span>
          <h1>
            Contact messages <span className="console-count">{summary.total}</span>
          </h1>
          <p>Messages sent through the website contact form, newest first.</p>
        </div>
        <div className="console-head__actions">
          <button type="button" className="ui-btn ui-btn--secondary" onClick={load}>
            <Icon name="refresh" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
        </div>
      )}
      {actionError && !selected && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="console-tabs" role="tablist" aria-label="Filter messages">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={statusFilter === tab.key}
            className={`console-tab ${statusFilter === tab.key ? "is-active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
            <span className="console-tab__count">{counts[tab.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="console-toolbar">
        <label className="ui-input-icon">
          <Icon name="search" />
          <span className="visually-hidden">Search messages</span>
          <input
            type="search"
            className="ui-input"
            placeholder="Search by name, email, subject or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="console-toolbar__spacer" />
        {!loading && (
          <span className="console-toolbar__meta">
            {filtered.length} of {messages.length} shown
          </span>
        )}
      </div>

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true" />
            <p>Loading messages...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={messages.length === 0 ? "No messages yet" : "No matching messages"}
          text={
            messages.length === 0
              ? "Messages from the Contact page will appear here."
              : "Try another status or search term."
          }
        />
      ) : (
        <div className="console-panel">
          <div className="console-table-wrap">
            <table className="console-table console-table--stack admin-messages-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th className="is-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((message) => (
                  <tr key={message._id} className={message.status === "new" ? "is-unread" : ""}>
                    <td className="is-primary" data-label="From">
                      <div className="console-cell">
                        <span className="console-avatar console-avatar--sm">
                          {String(message.name || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="console-cell__stack">
                          <strong>{message.name}</strong>
                          <span className="console-muted">{message.email}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Subject">
                      <div className="console-cell__stack admin-messages-table__subject">
                        <strong>{message.subject}</strong>
                        <span className="console-muted">{preview(message.message)}</span>
                      </div>
                    </td>
                    <td data-label="Received" className="is-num">{formatDateTime(message.createdAt)}</td>
                    <td data-label="Status">
                      <StatusBadge
                        status={message.status}
                        label={STATUS_LABELS[message.status]}
                        tone={STATUS_TONES[message.status]}
                      />
                    </td>
                    <td data-label="" className="is-right">
                      <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={() => openMessage(message)}>
                        <Icon name="eye" />
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal
          size="lg"
          title={selected.subject}
          subtitle={`From ${selected.name}, ${formatDateTime(selected.createdAt)}`}
          icon="mail"
          locked={busyId === selected._id && confirmDelete}
          onClose={() => {
            setSelected(null);
            setConfirmDelete(false);
          }}
          footer={
            confirmDelete ? (
              <>
                <span className="admin-messages__confirm">Delete this message permanently?</span>
                <button type="button" className="ui-btn ui-btn--secondary" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button type="button" className="ui-btn ui-btn--danger" onClick={removeMessage} disabled={busyId === selected._id}>
                  Yes, Delete
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="ui-btn ui-btn--danger-soft ui-btn--icon"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete message"
                  title="Delete"
                >
                  <Icon name="trash" />
                </button>
                <div className="admin-messages__spacer" />
                {selected.status !== "new" && (
                  <button
                    type="button"
                    className="ui-btn ui-btn--secondary"
                    onClick={() => changeStatus(selected, "new")}
                    disabled={busyId === selected._id}
                  >
                    Mark Unread
                  </button>
                )}
                {selected.status !== "resolved" ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn--secondary"
                    onClick={() => changeStatus(selected, "resolved")}
                    disabled={busyId === selected._id}
                  >
                    <Icon name="checkCircle" />
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ui-btn ui-btn--secondary"
                    onClick={() => changeStatus(selected, "read")}
                    disabled={busyId === selected._id}
                  >
                    Reopen
                  </button>
                )}
                <a
                  className="ui-btn"
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                >
                  <Icon name="send" />
                  Reply
                </a>
              </>
            )
          }
        >
          {actionError && (
            <div className="ui-alert ui-alert--error" role="alert">
              <Icon name="alertCircle" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="console-status-strip">
            <div>
              <span className="console-muted">Name</span>
              <strong>{selected.name}</strong>
            </div>
            <div>
              <span className="console-muted">Email</span>
              <a className="ui-link" href={`mailto:${selected.email}`}>{selected.email}</a>
            </div>
            <div>
              <span className="console-muted">Status</span>
              <StatusBadge
                status={selected.status}
                label={STATUS_LABELS[selected.status]}
                tone={STATUS_TONES[selected.status]}
              />
            </div>
          </div>

          <div className="admin-messages__body">{selected.message}</div>
        </Modal>
      )}
    </div>
  );
}

export default AdminContactMessages;
