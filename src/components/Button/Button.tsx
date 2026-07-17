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
    "bg-surface-secondary text-text-on-primary hover:bg-surface-secondary-dark",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses =
    variantClasses[variant] +
    " px-lg py-sm my-md rounded-lg disabled:opacity-50 hover:cursor-pointer transition-colors";

  return (
    <button className={`${baseClasses} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
