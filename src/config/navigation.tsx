import {
  MdAssignmentInd,
  MdAutoStories,
  MdContentPaste,
  MdLocalPolice,
  MdMedicalInformation,
  MdPeople,
  MdRecentActors,
} from "react-icons/md";
import { RoutePath, isRouteAuthorized } from "@/config/route-access";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types/role";

type IconComponent = React.ComponentType<{ size?: number }>;

export type NavPage = {
  path: string;
  label: string;
  // Only pages shown as icon pills (Gerenciamento's switcher) need one.
  icon?: IconComponent;
};

// A group opens as a drawer in the side panel; its pages are also the page's
// own switcher (header tabs, or Gerenciamento's pills), so both are always
// driven by the same list.
export type NavGroup = {
  kind: "group";
  id: string;
  title: string;
  icon: IconComponent;
  pages: NavPage[];
  // Gerenciamento switches its pages with pills in its toolbar instead.
  headerTabs: boolean;
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
export const MANAGEMENT_GROUP: NavGroup = {
  kind: "group",
  id: "management",
  title: "Gerenciamento",
  icon: MdRecentActors,
  headerTabs: false,
  pages: [
    { path: "/management/users", label: "Usuários", icon: MdPeople },
    {
      path: "/management/professions",
      label: "Áreas de Atuação",
      icon: MdAssignmentInd,
    },
    {
      path: "/management/specialities",
      label: "Especialidades",
      icon: MdMedicalInformation,
    },
    {
      path: "/management/roles",
      label: "Níveis de Permissão",
      icon: MdLocalPolice,
    },
  ],
};

export const MAIN_NAV: NavEntry[] = [
  link("/dashboard"),
  {
    kind: "group",
    id: "library",
    title: "Biblioteca",
    icon: MdAutoStories,
    headerTabs: true,
    pages: [
      { path: "/library/boards", label: "Pranchas" },
      { path: "/library/terms", label: "Termos" },
      { path: "/library/phrases", label: "Frases" },
    ],
  },
  {
    kind: "group",
    id: "resources",
    title: "Recursos",
    icon: MdContentPaste,
    headerTabs: true,
    pages: [
      { path: "/boards", label: "Pranchas" },
      { path: "/terms", label: "Termos" },
      { path: "/phrases", label: "Frases" },
    ],
  },
  link("/pictograms"),
  link("/sign-writings"),
  MANAGEMENT_GROUP,
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
