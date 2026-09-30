export type BadgeVariant = "success" | "secondary" | "neutral" | "warning";

function Badge({
  children,
  variant = "success",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const variantClasses: Record<BadgeVariant, string> = {
    success: "bg-success-secondary text-success",
    secondary: "bg-secondary/25 text-secondary",
    neutral: "bg-surface-secondary text-text-on-primary-variant",
    warning: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`px-sm py-xs rounded-sm text-body font-bold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
