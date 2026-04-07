import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-onPrimary font-body antialiased">{children}</body>
    </html>
  );
}
