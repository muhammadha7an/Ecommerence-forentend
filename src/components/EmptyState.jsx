import Icon from "./Icon.jsx";

function EmptyState({ icon = "inbox", title, text, children, className = "" }) {
  return (
    <div className={`ui-empty ${className}`.trim()}>
      <span className="ui-empty__icon">
        <Icon name={icon} />
      </span>
      {title && <h2 className="ui-empty__title">{title}</h2>}
      {text && <p className="ui-empty__text">{text}</p>}
      {children && <div className="ui-empty__actions">{children}</div>}
    </div>
  );
}

export default EmptyState;
