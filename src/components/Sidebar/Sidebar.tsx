"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdPerson, MdChevronRight, MdMenuOpen } from "react-icons/md";
import { ROUTES, RouteConfig } from "@/config/routes";
import { Role } from "@/utils/definitions";

function NavItem({ route, active }: { route: RouteConfig; active: boolean }) {
  const Icon = route.icon;
  return (
    <Link
      href={route.path}
      className={`flex items-center gap-sm px-md py-sm rounded-md text-body-emph transition-colors ${
        active
          ? "bg-surface-secondary text-primary-dark font-bold"
          : "text-text-on-primary hover:bg-surface-secondary"
      }`}
    >
      <Icon size={24} />
      <span>{route.title}</span>
    </Link>
  );
}

interface SidebarProps {
  userEmail: string;
  userRole: Role;
}

export default function Sidebar({ userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const allowedRoutes = ROUTES.filter(
    (r) =>
      r.allowedRoles === "all" || (r.allowedRoles as Role[]).includes(userRole),
  );

  const mainRoutes = allowedRoutes.filter((r) => r.placement === "main");
  const footerRoutes = allowedRoutes.filter((r) => r.placement === "footer");

  return (
    <nav className="flex flex-col w-64 h-screen bg-surface-primary border border-outline-common shrink-0">
      <div className="flex items-center justify-between px-md py-lg border-b border-outline-common">
        <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
        <button
          className="text-text-on-primary-variant hover:text-text-on-primary"
          aria-label="Menu"
        >
          <MdMenuOpen size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-xs px-sm pt-md flex-1">
        {mainRoutes.map((route) => (
          <NavItem
            key={route.path}
            route={route}
            active={isActive(route.path)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-xs px-sm pb-md">
        {footerRoutes.map((route) => (
          <NavItem
            key={route.path}
            route={route}
            active={isActive(route.path)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-xs px-sm pb-sm border-t border-outline-common pt-sm">
        <div className="flex items-center gap-sm px-md py-sm text-text-on-primary-variant text-body">
          <MdPerson size={20} />
          <span className="flex-1 truncate">{userEmail}</span>
          <MdChevronRight size={18} />
        </div>
      </div>
    </nav>
  );
}
