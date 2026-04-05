"use client";

import { usePathname } from "next/navigation";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { ROUTES } from "@/config/routes";

export default function Header() {
  const pathname = usePathname();

  const route = ROUTES.find(
    (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
  );

  return (
    <header className="flex items-center px-lg h-20 bg-surface-primary border border-l-0 border-outline-common shrink-0">
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
    </header>
  );
}
