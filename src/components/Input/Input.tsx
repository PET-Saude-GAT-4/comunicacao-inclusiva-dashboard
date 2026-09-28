import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = "", ...props }: InputProps) {
  const borderClasses = error
    ? "border-red-500 focus:ring-red-500"
    : "border-outline-common focus:border-primary-dark focus:ring-primary-dark";

  return (
    <div className="flex flex-col">
      {label && (
        <label className="text-text-on-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`border ${borderClasses} focus:outline-none focus:ring-1 text-text-on-primary p-sm px-lg bg-surface-secondary rounded-md ${className}`.trim()}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
