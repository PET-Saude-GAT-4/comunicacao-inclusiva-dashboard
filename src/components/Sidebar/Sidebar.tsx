"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MdPerson, MdLogout, MdMenuOpen, MdMenu } from "react-icons/md";
import { ROUTES, RouteConfig } from "@/config/routes";
import { Role } from "@/utils/definitions";
import { logout } from "@/services/auth";

function NavItem({
  route,
  active,
  expanded,
}: {
  route: RouteConfig;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = route.icon;
  return (
    <Link
      href={route.path}
      title={!expanded ? route.title : undefined}
      className={`flex items-center py-sm rounded-md text-body-emph transition-colors ${
        expanded ? "gap-sm px-md" : "justify-center"
      } ${
        active
          ? "bg-surface-secondary text-primary-dark font-bold"
          : "text-text-on-primary hover:bg-surface-secondary"
      }`}
    >
      <Icon size={24} />
      {expanded && <span>{route.title}</span>}
    </Link>
  );
}

const COOKIE_NAME = "sidebar-expanded";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

interface SidebarProps {
  userEmail: string;
  userRole: Role;
  initialExpanded?: boolean;
}

export default function Sidebar({
  userEmail,
  userRole,
  initialExpanded = true,
}: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}`;
      return next;
    });
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const allowedRoutes = ROUTES.filter(
    (r) =>
      r.allowedRoles === "all" || (r.allowedRoles as Role[]).includes(userRole),
  );

  const mainRoutes = allowedRoutes.filter((r) => r.placement === "main");
  const footerRoutes = allowedRoutes.filter((r) => r.placement === "footer");

  return (
    <nav
      className={`flex flex-col h-screen bg-surface-primary border border-outline-common shrink-0 transition-all duration-300 ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`flex items-center border-b border-outline-common px-md h-22 ${
          expanded ? "justify-between" : "justify-center"
        }`}
      >
        {expanded && (
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
        )}
        <button
          onClick={toggleExpanded}
          className="text-text-on-primary-variant hover:text-text-on-primary"
          aria-label={expanded ? "Recolher menu" : "Expandir menu"}
        >
          {expanded ? (
            <MdMenuOpen size={24} className="hover:cursor-pointer" />
          ) : (
            <MdMenu size={24} className="hover:cursor-pointer" />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-xs px-sm pt-md flex-1">
        {mainRoutes.map((route) => (
          <NavItem
            key={route.path}
            route={route}
            active={isActive(route.path)}
            expanded={expanded}
          />
        ))}
      </div>
      <div className="flex flex-col gap-xs px-sm pb-md">
        {footerRoutes.map((route) => (
          <NavItem
            key={route.path}
            route={route}
            active={isActive(route.path)}
            expanded={expanded}
          />
        ))}
      </div>
      <div className="flex flex-col gap-xs px-sm pb-sm border-t border-outline-common pt-sm">
        <div
          className={`flex items-center py-sm text-text-on-primary-variant text-body ${
            expanded ? "gap-sm px-md" : "justify-center"
          }`}
          title={!expanded ? userEmail : undefined}
        >
          <MdPerson size={20} />
          {expanded && <span className="flex-1 truncate">{userEmail}</span>}
          {expanded && (
            <form action={logout} className="flex items-center">
              <button
                type="submit"
                aria-label="Sair"
                className="text-text-on-primary-variant hover:text-text-on-primary transition-colors hover:cursor-pointer"
              >
                <MdLogout size={18} />
              </button>
            </form>
          )}
        </div>
        {!expanded && (
          <form
            action={logout}
            className="flex items-center justify-center px-md py-sm"
          >
            <button
              type="submit"
              aria-label="Sair"
              title="Sair"
              className="text-text-on-primary-variant hover:text-text-on-primary transition-colors hover:cursor-pointer"
            >
              <MdLogout size={18} />
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
