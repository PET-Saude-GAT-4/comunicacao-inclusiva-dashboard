import { MdContentPaste } from "react-icons/md";
import { RoutePath, isRouteAuthorized } from "@/config/route-access";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types/role";

type IconComponent = React.ComponentType<{ size?: number }>;

export type NavPage = { path: RoutePath; label: string };

// A group opens as a drawer in the side panel; its pages are also the tabs in
// the page header, so both are always driven by the same list.
export type NavGroup = {
  kind: "group";
  id: string;
  title: string;
  icon: IconComponent;
  pages: NavPage[];
};

export type NavLink = {
  kind: "link";
  path: RoutePath;
  title: string;
  icon: IconComponent;
};

export type NavEntry = NavGroup | NavLink;

function link(path: RoutePath): NavLink {
  const route = ROUTES.find((r) => r.path === path)!;
  return { kind: "link", path, title: route.title, icon: route.icon };
}

// Single source of truth for the side panel's order and grouping. Titles,
// subtitles and icons of individual routes stay in ROUTE_DISPLAY, and role
// rules in ROUTE_ACCESS.
export const MAIN_NAV: NavEntry[] = [
  link("/dashboard"),
  link("/library"),
  {
    kind: "group",
    id: "resources",
    title: "Recursos",
    icon: MdContentPaste,
    pages: [
      { path: "/boards", label: "Pranchas" },
      { path: "/terms", label: "Termos" },
      { path: "/phrases", label: "Frases" },
    ],
  },
  link("/pictograms"),
  link("/sign-writings"),
  link("/management"),
];

export const FOOTER_NAV: NavLink[] = [link("/settings"), link("/help")];

export function isPathActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + "/");
}

// Drops what the role may not open; a group with no page left disappears.
export function navForRole(entries: NavEntry[], role: Role): NavEntry[] {
  return entries.flatMap((entry): NavEntry[] => {
    if (entry.kind === "link") {
      return isRouteAuthorized(entry.path, role) ? [entry] : [];
    }
    const pages = entry.pages.filter((p) => isRouteAuthorized(p.path, role));
    return pages.length > 0 ? [{ ...entry, pages }] : [];
  });
}

// The group holding the current page, which is the one drawer that is open
// and whose pages show as header tabs.
export function findActiveGroup(
  entries: NavEntry[],
  pathname: string,
): NavGroup | undefined {
  return entries.find(
    (entry): entry is NavGroup =>
      entry.kind === "group" &&
      entry.pages.some((p) => isPathActive(pathname, p.path)),
  );
}
