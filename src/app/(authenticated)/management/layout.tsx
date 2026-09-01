"use client";

function ManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full bg-surface-secondary flex items-center justify-center px-xxl">
      <div className="h-full w-full bg-surface-primary flex items-center justify-center px-xxl py-lg rounded-md">
        <div className="h-full w-full outline-2 outline-outline-common rounded-lg overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ManagementLayout;
