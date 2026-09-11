import { useState } from "react";
import Icon from "./Icon.jsx";

/* Password input with a show/hide toggle. Accepts the same props as <input>. */
function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="ui-password">
      <input {...props} type={visible ? "text" : "password"} className={`ui-input ${className}`.trim()} />
      <button
        type="button"
        className="ui-password__toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        <Icon name={visible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}

export default PasswordInput;
