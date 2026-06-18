import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SERVERIZZ Input — dark field, steel border, electric focus ring. Supports
 * an optional leading icon, a label, and a mono variant for code-style input.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, mono = false, className, id, ...props }, ref) => {
    const inputId =
      id ||
      (label ? `szz-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
    return (
      <div className={cn("szz-field", mono && "szz-field--mono")}>
        {label && (
          <label className="szz-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="szz-input-wrap">
          {icon && <span className="szz-input-wrap__icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn("szz-input", icon && "szz-input--has-icon", className)}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
