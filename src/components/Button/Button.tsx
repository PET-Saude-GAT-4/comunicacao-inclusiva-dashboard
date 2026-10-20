import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "danger" | "neutral";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-dark text-white hover:bg-primary",
  danger: "bg-error-primary text-text-on-primary-dark hover:bg-error-secondary",
  neutral:
    "bg-surface-secondary text-text-on-primary font-medium outline outline-1 outline-gray-200 hover:bg-surface-secondary-dark",
};

// Tailwind orders utilities by its own rules, not by their order in the class
// string, so a caller's my-0 loses to the default my-md. The default margin is
// left out instead whenever the caller sets a vertical margin of its own.
const SETS_VERTICAL_MARGIN = /(^|\s)-?(my|mt|mb)-/;

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const margin = SETS_VERTICAL_MARGIN.test(className) ? "" : " my-md";
  const baseClasses =
    variantClasses[variant] +
    margin +
    " px-lg py-sm rounded-lg disabled:opacity-50 hover:cursor-pointer hover:opacity-75 transition-colors";

  return (
    <button className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
