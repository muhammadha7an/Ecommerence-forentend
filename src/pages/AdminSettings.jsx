import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import authService from "../services/authService";
import { setShippingSettings } from "../redux/slices/settingsSlice";
import { calculateShipping } from "../utils/commerce";
import Icon from "../components/Icon";
import PasswordInput from "../components/PasswordInput";

const TABS = [
  { key: "profile", label: "Admin Profile", icon: "user" },
  { key: "shipping", label: "Shipping", icon: "truck" },
  { key: "emails", label: "Email Templates", icon: "mail" },
];

const friendlyError = (err, fallback) =>
  err?.response?.status === 401
    ? "Your session has expired. Please sign in again."
    : err?.response?.data?.message || fallback;

function Feedback({ state }) {
  if (!state?.text) return null;
  const isError = state.type === "error";
  return (
    <div className={`ui-alert ${isError ? "ui-alert--error" : "ui-alert--success"}`} role={isError ? "alert" : "status"}>
      <Icon name={isError ? "alertCircle" : "checkCircle"} />
      <span>{state.text}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */
function ProfileSection({ profile, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const credentialsChanging =
    form.newPassword.length > 0 || form.email.trim().toLowerCase() !== String(profile?.email || "").toLowerCase();

  const submit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.name.trim()) return setFeedback({ type: "error", text: "Display name is required." });
    if (form.newPassword && form.newPassword.length < 8) {
      return setFeedback({ type: "error", text: "New password must be at least 8 characters." });
    }
    if (form.newPassword !== form.confirmPassword) {
      return setFeedback({ type: "error", text: "New password and confirmation do not match." });
    }
    if (credentialsChanging && !form.currentPassword) {
      return setFeedback({ type: "error", text: "Enter your current password to change your email or password." });
    }

    setSaving(true);
    try {
      const data = await authService.updateAdminProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setFeedback({ type: "success", text: data.message || "Profile updated" });
      onSaved?.(data.profile);
    } catch (err) {
      setFeedback({ type: "error", text: friendlyError(err, "Unable to update your profile.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="console-panel" onSubmit={submit}>
      <div className="console-panel__head">
        <div>
          <h2>Admin profile</h2>
          <p>Your display name, sign-in email and password.</p>
        </div>
        {profile?.credentialsManaged ? (
          <span className="ui-badge ui-badge--success ui-badge--dot">Custom credentials</span>
        ) : (
          <span className="ui-badge ui-badge--warning ui-badge--dot">Using .env sign-in</span>
        )}
      </div>

      <div className="console-panel__body console-form-fields">
        <Feedback state={feedback} />

        {!profile?.credentialsManaged && profile?.isPrimaryAdmin && (
          <div className="ui-alert ui-alert--info">
            <Icon name="info" />
            <span>
              You currently sign in with the username and password from the server's .env file. After you save a new
              email or password here, sign in with your email (or display name) and the new password instead.
            </span>
          </div>
        )}

        <div className="ui-form-grid">
          <div className="ui-field">
            <label className="ui-label" htmlFor="admin-name">Display name</label>
            <input id="admin-name" name="name" className="ui-input" value={form.name} onChange={change} maxLength={80} required />
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              className="ui-input"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <h3 className="admin-settings__legend">Change password</h3>
        <div className="ui-form-grid">
          <div className="ui-field">
            <label className="ui-label" htmlFor="admin-new-password">New password</label>
            <PasswordInput
              id="admin-new-password"
              name="newPassword"
              value={form.newPassword}
              onChange={change}
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
            <span className="ui-hint">At least 8 characters.</span>
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="admin-confirm-password">Confirm new password</label>
            <PasswordInput
              id="admin-confirm-password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              autoComplete="new-password"
            />
          </div>
          <div className="ui-field ui-field--full">
            <label className="ui-label" htmlFor="admin-current-password">
              Current password {credentialsChanging && <span className="ui-required">*</span>}
            </label>
            <PasswordInput
              id="admin-current-password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={change}
              autoComplete="current-password"
              placeholder="Required when changing email or password"
            />
          </div>
        </div>
      </div>

      <div className="admin-settings__actions">
        <button type="submit" className="ui-btn" disabled={saving}>
          {saving ? <span className="ui-spinner" aria-hidden="true" /> : <Icon name="check" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Shipping                                                           */
/* ------------------------------------------------------------------ */
function ShippingSection({ shipping, onSaved }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    freeShippingThreshold: String(shipping?.freeShippingThreshold ?? ""),
    shippingFee: String(shipping?.shippingFee ?? ""),
    methodName: shipping?.methodName || "Standard shipping",
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const threshold = Number(form.freeShippingThreshold);
  const fee = Number(form.shippingFee);
  const valid =
    form.freeShippingThreshold !== "" && form.shippingFee !== "" && Number.isFinite(threshold) && Number.isFinite(fee) && threshold >= 0 && fee >= 0;

  const previewSettings = valid ? { freeShippingThreshold: threshold, shippingFee: fee } : null;
  const examples = valid
    ? [...new Set([Math.max(threshold - 20, 1), Math.max(threshold - 0.01, 0.5), threshold, threshold + 25].map((v) => Math.round(v * 100) / 100))]
    : [];

  const submit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    if (!valid) return setFeedback({ type: "error", text: "Enter a threshold and fee of 0 or more." });

    setSaving(true);
    try {
      const data = await authService.updateAdminSettings({
        shipping: { freeShippingThreshold: threshold, shippingFee: fee, methodName: form.methodName },
      });
      dispatch(setShippingSettings(data.settings.shipping));
      setFeedback({ type: "success", text: "Shipping settings saved. The cart and checkout now use these values." });
      onSaved?.(data.settings);
    } catch (err) {
      setFeedback({ type: "error", text: friendlyError(err, "Unable to save shipping settings.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="console-panel" onSubmit={submit}>
      <div className="console-panel__head">
        <div>
          <h2>Shipping settings</h2>
          <p>Applied to the cart, checkout and every new order. The server always recalculates at checkout.</p>
        </div>
      </div>

      <div className="console-panel__body console-form-fields">
        <Feedback state={feedback} />

        <div className="ui-form-grid">
          <div className="ui-field">
            <label className="ui-label" htmlFor="ship-threshold">Free shipping threshold ($)</label>
            <input
              id="ship-threshold"
              name="freeShippingThreshold"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="ui-input"
              value={form.freeShippingThreshold}
              onChange={change}
              required
            />
            <span className="ui-hint">Orders with a subtotal at or above this amount ship free.</span>
          </div>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ship-fee">Shipping fee ($)</label>
            <input
              id="ship-fee"
              name="shippingFee"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="ui-input"
              value={form.shippingFee}
              onChange={change}
              required
            />
            <span className="ui-hint">Charged below the threshold. Set 0 to make all shipping free.</span>
          </div>
          <div className="ui-field ui-field--full">
            <label className="ui-label" htmlFor="ship-method">Shipping method name</label>
            <input
              id="ship-method"
              name="methodName"
              className="ui-input"
              value={form.methodName}
              onChange={change}
              maxLength={80}
            />
            <span className="ui-hint">Shown on Stripe, receipts and order emails.</span>
          </div>
        </div>

        {valid && (
          <div className="admin-settings__preview">
            <h3>Preview</h3>
            <div className="console-table-wrap">
              <table className="console-table console-table--stack admin-settings__preview-table">
                <thead>
                  <tr>
                    <th>Cart subtotal</th>
                    <th>Shipping</th>
                    <th className="is-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {examples.map((amount) => {
                    const quote = calculateShipping(amount, previewSettings);
                    return (
                      <tr key={amount}>
                        <td data-label="Subtotal" className="is-num">${amount.toFixed(2)}</td>
                        <td data-label="Shipping">
                          {quote.isFree ? (
                            <span className="ui-badge ui-badge--success">FREE</span>
                          ) : (
                            `$${quote.shippingFee.toFixed(2)}`
                          )}
                        </td>
                        <td data-label="Total" className="is-right is-num">
                          <strong>${quote.total.toFixed(2)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="admin-settings__actions">
        <button type="submit" className="ui-btn" disabled={saving || !valid}>
          {saving ? <span className="ui-spinner" aria-hidden="true" /> : <Icon name="check" />}
          {saving ? "Saving..." : "Save Shipping"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Email templates                                                    */
/* ------------------------------------------------------------------ */
function EmailSection({ settings, onSaved }) {
  const catalog = settings.templateCatalog || [];
  const [general, setGeneral] = useState({
    storeName: settings.emails?.storeName || "Aura",
    adminEmail: settings.emails?.adminEmail || "",
  });
  const [templates, setTemplates] = useState(() =>
    Object.fromEntries(
      catalog.map((entry) => {
        const saved = settings.emails?.templates?.[entry.key] || {};
        return [
          entry.key,
          {
            enabled: saved.enabled !== false,
            subject: saved.subject || "",
            heading: saved.heading || "",
            message: saved.message || "",
          },
        ];
      })
    )
  );
  const [openKey, setOpenKey] = useState(catalog[0]?.key || null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const updateTemplate = (key, field, value) =>
    setTemplates((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const resetTemplate = (key) =>
    setTemplates((prev) => ({ ...prev, [key]: { ...prev[key], subject: "", heading: "", message: "" } }));

  const submit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const data = await authService.updateAdminSettings({ emails: { ...general, templates } });
      setFeedback({ type: "success", text: "Email settings saved." });
      onSaved?.(data.settings);
    } catch (err) {
      setFeedback({ type: "error", text: friendlyError(err, "Unable to save email settings.") });
    } finally {
      setSaving(false);
    }
  };

  const system = settings.system || {};

  return (
    <form className="console-form-stack" onSubmit={submit}>
      <section className="console-panel">
        <div className="console-panel__head">
          <div>
            <h2>Email delivery</h2>
            <p>SMTP credentials stay in the server environment and are never shown here.</p>
          </div>
          {system.emailConfigured ? (
            <span className="ui-badge ui-badge--success ui-badge--dot">SMTP connected</span>
          ) : (
            <span className="ui-badge ui-badge--danger ui-badge--dot">SMTP not configured</span>
          )}
        </div>
        <div className="console-panel__body console-form-fields">
          <Feedback state={feedback} />

          {!system.emailConfigured && (
            <div className="ui-alert ui-alert--warning">
              <Icon name="alertTriangle" />
              <span>
                Emails are skipped until EMAIL_USER and EMAIL_PASSWORD are set in the backend .env file. Orders,
                sign-ups and contact messages still work normally.
              </span>
            </div>
          )}

          <div className="ui-form-grid">
            <div className="ui-field">
              <label className="ui-label" htmlFor="mail-store">Store name in emails</label>
              <input
                id="mail-store"
                className="ui-input"
                value={general.storeName}
                onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
                maxLength={80}
              />
            </div>
            <div className="ui-field">
              <label className="ui-label" htmlFor="mail-admin">Admin notification email</label>
              <input
                id="mail-admin"
                type="email"
                className="ui-input"
                value={general.adminEmail}
                onChange={(e) => setGeneral({ ...general, adminEmail: e.target.value })}
                placeholder={system.notificationRecipient || "admin@yourstore.com"}
              />
              <span className="ui-hint">
                New orders and contact messages go here. Leave blank to use{" "}
                {system.notificationRecipient ? <strong>{system.notificationRecipient}</strong> : "your admin email"}.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="console-panel">
        <div className="console-panel__head">
          <div>
            <h2>Customer email templates</h2>
            <p>Leave a field blank to use the default wording. Use placeholders like {"{{name}}"} for dynamic values.</p>
          </div>
        </div>

        <div className="admin-templates">
          {catalog.map((entry) => {
            const value = templates[entry.key] || {};
            const isOpen = openKey === entry.key;
            return (
              <div className={`admin-template ${isOpen ? "is-open" : ""}`} key={entry.key}>
                <div className="admin-template__head">
                  <button
                    type="button"
                    className="admin-template__toggle"
                    onClick={() => setOpenKey(isOpen ? null : entry.key)}
                    aria-expanded={isOpen}
                    aria-controls={`tpl-${entry.key}`}
                  >
                    <span className="admin-template__title">
                      <strong>{entry.label}</strong>
                      <small>{entry.description}</small>
                    </span>
                    <Icon name="chevronDown" />
                  </button>
                  <label className="ui-check admin-template__switch" title="Send this email">
                    <input
                      type="checkbox"
                      checked={value.enabled}
                      onChange={(e) => updateTemplate(entry.key, "enabled", e.target.checked)}
                    />
                    <span>{value.enabled ? "On" : "Off"}</span>
                  </label>
                </div>

                {isOpen && (
                  <div className="admin-template__body" id={`tpl-${entry.key}`}>
                    <div className="ui-field">
                      <label className="ui-label" htmlFor={`tpl-${entry.key}-subject`}>Subject</label>
                      <input
                        id={`tpl-${entry.key}-subject`}
                        className="ui-input"
                        value={value.subject}
                        onChange={(e) => updateTemplate(entry.key, "subject", e.target.value)}
                        placeholder={entry.defaults.subject}
                        maxLength={200}
                      />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label" htmlFor={`tpl-${entry.key}-heading`}>Heading</label>
                      <input
                        id={`tpl-${entry.key}-heading`}
                        className="ui-input"
                        value={value.heading}
                        onChange={(e) => updateTemplate(entry.key, "heading", e.target.value)}
                        placeholder={entry.defaults.heading}
                        maxLength={200}
                      />
                    </div>
                    <div className="ui-field">
                      <label className="ui-label" htmlFor={`tpl-${entry.key}-message`}>Message</label>
                      <textarea
                        id={`tpl-${entry.key}-message`}
                        className="ui-textarea"
                        rows="4"
                        value={value.message}
                        onChange={(e) => updateTemplate(entry.key, "message", e.target.value)}
                        placeholder={entry.defaults.message}
                        maxLength={2000}
                      />
                      <span className="ui-hint">
                        Order details, totals and buttons are added automatically below this message.
                      </span>
                    </div>
                    <div className="admin-template__foot">
                      <div className="console-chips">
                        {entry.placeholders.map((placeholder) => (
                          <code className="console-chip" key={placeholder}>{`{{${placeholder}}}`}</code>
                        ))}
                      </div>
                      <button type="button" className="ui-btn ui-btn--ghost ui-btn--sm" onClick={() => resetTemplate(entry.key)}>
                        <Icon name="rotateCcw" />
                        Use default text
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="console-form-actions">
        <button type="submit" className="ui-btn" disabled={saving}>
          {saving ? <span className="ui-spinner" aria-hidden="true" /> : <Icon name="check" />}
          {saving ? "Saving..." : "Save Email Settings"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const activeTab = TABS.some((tab) => tab.key === requested) ? requested : "profile";

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadVersion, setLoadVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authService.getAdminSettings();
      setSettings(data.settings);
      setLoadVersion((value) => value + 1);
    } catch (err) {
      setError(friendlyError(err, "Unable to load settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mergeSettings = (next) => setSettings((prev) => ({ ...prev, ...next }));

  return (
    <div className="console-page">
      <div className="console-head">
        <div>
          <span className="console-head__eyebrow">Store configuration</span>
          <h1>Settings</h1>
          <p>Manage your admin account, shipping rules and customer emails.</p>
        </div>
      </div>

      <div className="console-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`console-tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setSearchParams({ tab: tab.key }, { replace: true })}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="ui-alert ui-alert--error" role="alert">
          <Icon name="alertCircle" />
          <span>{error}</span>
          <button type="button" className="ui-btn ui-btn--secondary ui-btn--sm" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="console-panel">
          <div className="ui-loading">
            <span className="ui-spinner ui-spinner--lg" aria-hidden="true" />
            <p>Loading settings...</p>
          </div>
        </div>
      ) : settings ? (
        <div className="admin-settings">
          {activeTab === "profile" && (
            <ProfileSection
              key={`profile-${loadVersion}`}
              profile={settings.profile}
              onSaved={(profile) => mergeSettings({ profile })}
            />
          )}
          {activeTab === "shipping" && (
            <ShippingSection key={`shipping-${loadVersion}`} shipping={settings.shipping} onSaved={mergeSettings} />
          )}
          {activeTab === "emails" && (
            <EmailSection key={`emails-${loadVersion}`} settings={settings} onSaved={mergeSettings} />
          )}
        </div>
      ) : null}
    </div>
  );
}

export default AdminSettings;
