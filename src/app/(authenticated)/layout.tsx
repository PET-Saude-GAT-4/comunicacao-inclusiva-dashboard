import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/utils/session";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const sidebarExpanded =
    cookieStore.get("sidebar-expanded")?.value !== "false";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userEmail={session.email}
        userRole={session.role}
        initialExpanded={sidebarExpanded}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-surface-primary">
          {children}
        </main>
      </div>
    </div>
  );
}
