function SignWritingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-xxl">
      <div className="min-h-screen w-full bg-surface-primary flex items-center justify-center px-xxl py-lg rounded-md">
        <div className="min-h-screen w-full outline-2 outline-outline-common rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

export default SignWritingsLayout;
