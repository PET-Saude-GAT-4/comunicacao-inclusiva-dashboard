import "../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      {/* h-fit and w-fit are the magic "wrap content" buttons */}
      <div className="h-fit w-fit bg-background rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
