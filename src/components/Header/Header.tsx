"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { ROUTES } from "@/config/routes";
import {
  MAIN_NAV,
  findActiveGroup,
  isPageActive,
  navForRole,
} from "@/config/navigation";
import { Role } from "@/types/role";

export default function Header({ userRole }: { userRole: Role }) {
  const pathname = usePathname();

  const route = ROUTES.find(
    (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
  );

  // A page inside a side panel group also lists the group's pages as tabs,
  // so a page can be switched from here or from the panel's drawer.
  const group = findActiveGroup(navForRole(MAIN_NAV, userRole), pathname);

  return (
    <header className="flex flex-col bg-surface-primary rounded-md border border-outline-common shrink-0">
      <div className="flex items-center px-lg h-20">
        <div className="flex flex-col">
          <h1 className="text-heading font-bold text-text-on-primary uppercase">
            {route?.title ?? ""}
          </h1>
          <p className="text-body text-text-on-primary-variant">
            {route?.subtitle ?? ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-xs">
          <button
            onClick={() => window.history.back()}
            className="p-xs rounded-xs text-text-on-primary hover:bg-surface-secondary transition-colors border border-outline-common"
            aria-label="Voltar"
          >
            <MdChevronLeft size={24} />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="p-xs rounded-xs text-text-on-primary hover:bg-surface-secondary transition-colors border border-outline-common"
            aria-label="Avançar"
          >
            <MdChevronRight size={24} />
          </button>
        </div>
      </div>
      {group?.headerTabs && (
        <nav aria-label={group.title} className="px-lg pb-lg">
          <ul className="flex w-fit rounded-t-[5px] bg-outline-common/40 overflow-hidden">
            {group.pages.map((page) => {
              const active = isPageActive(pathname, page);
              return (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-center w-[150px] h-[57px] font-title text-[16px] font-semibold text-[#3f4946] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-dark ${
                      active
                        ? "bg-white border-b-[5px] border-primary-dark"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  >
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
