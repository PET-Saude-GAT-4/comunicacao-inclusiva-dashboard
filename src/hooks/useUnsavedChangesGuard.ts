"use client";

import { useCallback, useEffect, useState } from "react";

// Guards a page holding unsaved edits against being navigated away from.
//
// Two escapes have to be covered separately. Reload and tab close go through
// `beforeunload`. In-app navigation does not: the App Router offers no hook to
// abort a route change, so a sidebar <Link> is caught by listening for the
// click in the capture phase, before Next.js's own handler sees it.
//
// The blocked destination is handed back instead of being confirmed here, so
// the page can ask with the same Modal it uses everywhere else. Navigate with
// router.push once the user accepts (a programmatic push is not an anchor
// click, so it will not be intercepted again).
export function useUnsavedChangesGuard(dirty: boolean) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const cancel = useCallback(() => setPendingHref(null), []);

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();

    const handleClick = (e: MouseEvent) => {
      // Leave modified clicks alone: they open a new tab, so this page stays.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [dirty]);

  // Derived rather than cleared on save, so a destination captured while dirty
  // cannot outlive the edits that justified blocking it.
  return { pendingHref: dirty ? pendingHref : null, cancel };
}
