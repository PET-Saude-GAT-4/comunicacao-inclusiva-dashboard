"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MANAGEMENT_GROUP, isPathActive } from "@/config/navigation";

// Gerenciamento's section switcher. It reads the same pages as the side
// panel's drawer, so both always agree with the route. Sections show as icon
// pills; the current one also shows its name.
function ManagementTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label={MANAGEMENT_GROUP.title}>
      <ul className="flex items-center gap-sm">
        {MANAGEMENT_GROUP.pages.map((page) => {
          const active = isPathActive(pathname, page.path);
          const Icon = page.icon;
          return (
            <li key={page.path}>
              <Link
                href={page.path}
                aria-current={active ? "page" : undefined}
                aria-label={active ? undefined : page.label}
                title={active ? undefined : page.label}
                className={`flex items-center h-[45px] rounded-sm border border-[#dae1e5] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark ${
                  active
                    ? "gap-sm px-sm bg-primary-dark text-[#ecf2ef]"
                    : "w-[44px] justify-center text-[#3f4946] hover:bg-surface-secondary"
                }`}
              >
                {Icon && <Icon size={24} />}
                {active && (
                  <span className="font-title text-[16px] font-semibold whitespace-nowrap">
                    {page.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default ManagementTabs;
