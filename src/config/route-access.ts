import { Role } from "@/types/role";

export type RouteAccess = {
  path: string;
  allowedRoles: "all" | readonly Role[];
};

// Single source of truth for the app's routes and their role authorization.
export const ROUTE_ACCESS = [
  { path: "/dashboard", allowedRoles: "all" },
  { path: "/library", allowedRoles: "all" },
  { path: "/boards", allowedRoles: ["super_admin", "admin"] },
  { path: "/pictograms", allowedRoles: ["super_admin", "admin"] },
  { path: "/management", allowedRoles: ["super_admin", "admin"] },
  { path: "/settings", allowedRoles: "all" },
  { path: "/help", allowedRoles: "all" },
] as const satisfies readonly RouteAccess[];

// Union of every known route path, derived from ROUTE_ACCESS.
export type RoutePath = (typeof ROUTE_ACCESS)[number]["path"];

// Most-specific matching prefix wins. Unlisted authenticated routes are open
// to any logged-in user (returns true).
export function isRouteAuthorized(pathname: string, role: Role): boolean {
  const match = ROUTE_ACCESS.filter(
    (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
  ).sort((a, b) => b.path.length - a.path.length)[0];

  if (!match) return true;
  return (
    match.allowedRoles === "all" ||
    (match.allowedRoles as readonly Role[]).includes(role)
  );
}
