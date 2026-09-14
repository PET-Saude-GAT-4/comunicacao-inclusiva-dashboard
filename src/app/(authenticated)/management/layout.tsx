"use client";

function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-center px-xxl py-lg">
      {children}
    </div>
  );
}

export default ManagementLayout;
