"use client";

import { useEffect, useRef } from "react";
import Spinner from "@/components/Spinner/Spinner";
import { RemoteSearch } from "@/hooks/useRemoteSearch";

type Props<T> = {
  list: RemoteSearch<T>;
  children: React.ReactNode;
  className?: string;
};

// The scrolling list of a picker, fed by useRemoteSearch. The next page loads
// when a sentinel after the last item comes within 100px of the bottom.
export default function InfiniteList<T>({
  list,
  children,
  className = "h-96",
}: Props<T>) {
  const { loading, error, hasMore, loadMore, retry, items } = list;
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // A new observer reports the sentinel's state as soon as it starts, so
  // re-creating it after each page lands keeps loading while the items still
  // do not fill the area, without the user scrolling.
  useEffect(() => {
    if (!hasMore || loading || error || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root: rootRef.current, rootMargin: "100px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, error, loadMore]);

  return (
    <div ref={rootRef} className={`flex flex-col overflow-y-auto ${className}`}>
      <ul className="flex flex-col gap-md" aria-busy={loading}>
        {children}
      </ul>
      {loading && <Spinner />}
      {error && (
        <p className="py-sm text-center text-sm text-red-500">
          Não foi possível carregar.{" "}
          <button
            type="button"
            className="font-semibold underline hover:cursor-pointer"
            onClick={retry}
          >
            Tentar novamente
          </button>
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="py-sm text-sm text-text-on-primary-variant">
          Nenhum resultado
        </p>
      )}
      {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-px" />}
    </div>
  );
}
