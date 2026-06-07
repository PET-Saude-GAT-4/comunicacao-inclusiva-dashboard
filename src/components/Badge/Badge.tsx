function Badge({
  children,
  variant = "success",
}: {
  children: React.ReactNode;
  variant?: "success" | "neutral";
}) {
  const variantClasses =
    variant === "success"
      ? "bg-success-secondary text-success"
      : "bg-surface-secondary text-text-on-primary-variant";

  return (
    <span
      className={`px-sm py-xs rounded-sm text-body font-bold ${variantClasses}`}
    >
      {children}
    </span>
  );
}

export default Badge;
