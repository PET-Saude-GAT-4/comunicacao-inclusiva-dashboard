"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MdExpandMore,
  MdPerson,
  MdLogout,
  MdMenuOpen,
  MdMenu,
} from "react-icons/md";
import {
  FOOTER_NAV,
  MAIN_NAV,
  NavGroup,
  NavLink,
  findActiveGroup,
  isPathActive,
  navForRole,
} from "@/config/navigation";
import { Role } from "@/types/role";
import { logout } from "@/services/auth";

// Sub-page rows are 45px tall with 24px between them, so each row's centre,
// where its rail dot sits, is this far below the previous one.
const SUB_ROW_HEIGHT = 45;
const SUB_ROW_STEP = SUB_ROW_HEIGHT + 24;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark";

function rowClasses(active: boolean, expanded: boolean): string {
  return [
    "flex items-center h-[45px] rounded-[20px] text-[20px] font-medium transition-colors",
    expanded ? "gap-sm pl-[12px]" : "justify-center",
    active
      ? "bg-outline-common/25 text-primary-dark"
      : "text-[#3f4946] hover:bg-outline-common/25",
    FOCUS_RING,
  ].join(" ");
}

function NavLinkRow({
  entry,
  active,
  expanded,
}: {
  entry: NavLink;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.path}
      aria-current={active ? "page" : undefined}
      aria-label={!expanded ? entry.title : undefined}
      title={!expanded ? entry.title : undefined}
      className={rowClasses(active, expanded)}
    >
      <Icon size={24} />
      {expanded && <span>{entry.title}</span>}
    </Link>
  );
}

function NavGroupDrawer({
  group,
  open,
  expanded,
  pathname,
}: {
  group: NavGroup;
  open: boolean;
  expanded: boolean;
  pathname: string;
}) {
  const router = useRouter();
  const Icon = group.icon;
  const listId = `nav-group-${group.id}`;

  // Opening a group always lands on its first page; the open group follows
  // the route, so clicking the one already open has nothing to do.
  const openGroup = () => {
    if (!open) router.push(group.pages[0].path);
  };

  const header = (
    <button
      type="button"
      onClick={openGroup}
      aria-expanded={open}
      aria-controls={expanded && open ? listId : undefined}
      aria-label={!expanded ? group.title : undefined}
      title={!expanded ? group.title : undefined}
      className={`w-full hover:cursor-pointer ${rowClasses(open, expanded)}`}
    >
      <Icon size={24} />
      {expanded && <span>{group.title}</span>}
      {/* Marks the rows that open a drawer, apart from plain links. */}
      {expanded && (
        <MdExpandMore aria-hidden size={24} className="ml-auto mr-[12px]" />
      )}
    </button>
  );

  // Collapsed, a group is just its icon: the header tabs switch its pages.
  if (!expanded || !open) return header;

  const activeIndex = group.pages.findIndex((p) =>
    isPathActive(pathname, p.path),
  );
  const dotCenter = (index: number) =>
    index * SUB_ROW_STEP + SUB_ROW_HEIGHT / 2;

  return (
    <div className="rounded-[20px] bg-outline-common/25 pb-[15px]">
      {header}
      <div id={listId} className="relative mt-[25px]">
        {/* The rail: a line from the top of the first row to the last dot,
            green down to the active page's dot. */}
        <span
          aria-hidden
          className="absolute left-[29px] top-0 w-[2px] bg-outline-common"
          style={{ height: dotCenter(group.pages.length - 1) }}
        />
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute left-[29px] top-0 w-[2px] bg-primary-dark"
            style={{ height: dotCenter(activeIndex) }}
          />
        )}
        <ul className="flex flex-col gap-lg">
          {group.pages.map((page, index) => {
            const active = index === activeIndex;
            return (
              <li key={page.path} className="relative">
                <span
                  aria-hidden
                  className={`absolute left-[25px] top-1/2 -translate-y-1/2 size-[10px] rounded-full ${
                    active ? "bg-primary-dark" : "bg-outline-common"
                  }`}
                />
                <Link
                  href={page.path}
                  aria-current={active ? "page" : undefined}
                  className={`ml-[56px] mr-[31px] flex items-center h-[45px] pl-sm rounded-[20px] text-[20px] transition-colors ${FOCUS_RING} ${
                    active
                      ? "bg-white text-primary-dark font-medium"
                      : "text-[#3f4946] font-normal hover:bg-white/60"
                  }`}
                >
                  {page.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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

  const mainNav = navForRole(MAIN_NAV, userRole);
  const footerNav = navForRole(FOOTER_NAV, userRole) as NavLink[];
  const activeGroup = findActiveGroup(mainNav, pathname);

  return (
    <nav
      className={`flex flex-col bg-surface-primary shrink-0 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        expanded ? "w-[351px]" : "w-16"
      }`}
    >
      <div
        className={`flex items-center border-b border-outline-common px-md h-20 shrink-0 ${
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
      <div
        className={`flex flex-col gap-lg pt-xl flex-1 overflow-y-auto ${
          expanded ? "px-xl" : "px-sm"
        }`}
      >
        {mainNav.map((entry) =>
          entry.kind === "group" ? (
            <NavGroupDrawer
              key={entry.id}
              group={entry}
              open={entry.id === activeGroup?.id}
              expanded={expanded}
              pathname={pathname}
            />
          ) : (
            <NavLinkRow
              key={entry.path}
              entry={entry}
              active={isPathActive(pathname, entry.path)}
              expanded={expanded}
            />
          ),
        )}
      </div>
      <div
        className={`flex flex-col gap-lg pt-lg pb-xxl ${
          expanded ? "px-xl" : "px-sm"
        }`}
      >
        {footerNav.map((entry) => (
          <NavLinkRow
            key={entry.path}
            entry={entry}
            active={isPathActive(pathname, entry.path)}
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
