import { useEffect } from "react";
import Icon from "./Icon.jsx";

/*
 * Modal — accessible dialog shell. Closes on Escape and on backdrop click
 * (unless `locked` is true, e.g. while a request is running).
 */
function Modal({ title, subtitle, onClose, locked = false, size, icon, footer, children, labelledBy = "ui-modal-title" }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !locked) onClose?.();
    };

    document.addEventListener("keydown", onKey);
    document.body.classList.add("is-scroll-locked");

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-scroll-locked");
    };
  }, [onClose, locked]);

  return (
    <div
      className="ui-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !locked) onClose?.();
      }}
    >
      <div
        className={`ui-modal ${size === "lg" ? "ui-modal--lg" : ""}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <div className="ui-modal__header">
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", minWidth: 0 }}>
            {icon && (
              <span className="ui-modal__icon">
                <Icon name={icon} />
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <h3 className="ui-modal__title" id={labelledBy}>
                {title}
              </h3>
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="ui-btn ui-btn--ghost ui-btn--icon ui-btn--sm"
            onClick={onClose}
            disabled={locked}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
