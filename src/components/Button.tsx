import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`bg-primary-dark text-white px-lg py-sm my-md rounded-lg disabled:opacity-50 hover:cursor-pointer ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
