export type BadgeVariant = "success" | "secondary" | "neutral" | "warning";

function Badge({
  children,
  variant = "success",
  title,
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  // Shown on hover, e.g. the full text of a badge cut short to fit.
  title?: string;
  className?: string;
}) {
  const variantClasses: Record<BadgeVariant, string> = {
    success: "bg-success-secondary text-success",
    secondary: "bg-secondary/25 text-secondary",
    neutral: "bg-surface-secondary text-text-on-primary-variant",
    warning: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      title={title}
      className={`px-sm py-xs rounded-sm text-body font-bold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
