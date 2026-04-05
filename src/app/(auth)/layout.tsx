export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="h-fit w-120 bg-background rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
