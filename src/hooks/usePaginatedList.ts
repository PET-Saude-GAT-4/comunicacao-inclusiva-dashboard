"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListQuery, PageMeta, Paginated } from "@/types/common";

const SEARCH_DEBOUNCE_MS = 300;

type Filters = Record<string, string | undefined>;

type Options = {
  pageSize: number;
  // URL params, besides page and q, that the endpoint filters by.
  filterKeys?: string[];
};

// One page of a server-paginated list, with its page, search and filters kept
// in the URL so that a reload, a shared link or the back button lands on the
// same view. Moving through pages uses replace, so paging never piles up
// history entries.
//
// The selection lives here because it has to be dropped whenever the view
// changes: a bulk delete must never reach rows the user can no longer see.
// For the same reason, rows are only handed out once they belong to the
// current view; while the next page loads there are none to tick.
//
// It reads useSearchParams, so the page using it needs a Suspense boundary
// above it.
export function usePaginatedList<K extends string, T>(
  key: K,
  fetchPage: (query: ListQuery, filters: Filters) => Promise<Paginated<K, T>>,
  { pageSize, filterKeys = [] }: Options,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage : 1;
  const q = searchParams.get("q") ?? "";
  const filters: Filters = Object.fromEntries(
    filterKeys.map((name) => [name, searchParams.get(name) ?? undefined]),
  );
  // A string, so the fetch effect can depend on the filters' values instead
  // of an object rebuilt on every render.
  const filtersKey = JSON.stringify(filters);
  const viewKey = JSON.stringify([page, q, filtersKey]);

  const [search, setSearchInput] = useState(q);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    viewKey: string;
    items: T[];
    meta: PageMeta | null;
    failed: boolean;
  } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The view can also change without going through this hook, like a link to
  // the same route that drops the query string. Adjusting state during render
  // keeps the selection and the search box in step with the URL either way.
  const [seenViewKey, setSeenViewKey] = useState(viewKey);
  if (viewKey !== seenViewKey) {
    setSeenViewKey(viewKey);
    setSelectedIds([]);
    // Compared trimmed, so the debounced write of "gato " as "gato" does not
    // eat the space the user is still typing after.
    if (q !== search.trim()) setSearchInput(q);
  }

  // Rows from another view are withheld, but a refresh of the same view keeps
  // showing the rows it is replacing, so a create or delete does not blink.
  const current = result?.viewKey === viewKey ? result : null;
  // The last known page count keeps the pagination bar steady while loading.
  const knownPageCount = result?.meta?.pageCount ?? 1;

  // Reads the live URL rather than the render's searchParams, since a
  // debounced search can fire after the page or a filter has changed.
  const updateUrl = useCallback(
    (changes: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [name, value] of Object.entries(changes)) {
        if (value === undefined || value === "") params.delete(name);
        else params.set(name, String(value));
      }
      if (params.get("page") === "1") params.delete("page");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

  const setPage = (nextPage: number) =>
    updateUrl({
      page: Math.min(Math.max(1, nextPage), Math.max(1, knownPageCount)),
    });

  const setSearch = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      // Typing only spaces leaves the search unchanged, so the page stays.
      const currentQ = new URLSearchParams(window.location.search).get("q");
      if (value.trim() === (currentQ ?? "")) return;
      updateUrl({ q: value.trim(), page: undefined });
    }, SEARCH_DEBOUNCE_MS);
  };

  const setFilter = (name: string, value: string | undefined) =>
    updateUrl({ [name]: value, page: undefined });

  // Refetches the current page, e.g. after a create or a delete. The
  // selection is the caller's to adjust, since only it knows what went away.
  const refresh = () => setVersion((count) => count + 1);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useEffect(() => {
    let cancelled = false;

    fetchPage({ page, pageSize, q: q || undefined }, JSON.parse(filtersKey))
      .then((data) => {
        if (cancelled) return;
        // A page left empty, by a delete or by a stale link, steps back
        // towards the last page that still has rows.
        if (data[key].length === 0 && page > 1) {
          updateUrl({
            page: Math.min(page - 1, Math.max(1, data.meta.pageCount)),
          });
          return;
        }
        setResult({
          viewKey,
          items: data[key],
          meta: data.meta,
          failed: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setResult((previous) => ({
          viewKey,
          items: [],
          meta: previous?.meta ?? null,
          failed: true,
        }));
      });

    return () => {
      cancelled = true;
    };
    // version is not read inside, but bumping it is what refresh() means.
  }, [
    key,
    fetchPage,
    page,
    pageSize,
    q,
    filtersKey,
    viewKey,
    version,
    updateUrl,
  ]);

  return {
    items: current?.items ?? [],
    loaded: current !== null,
    error: current?.failed ? "Não foi possível carregar a lista." : null,
    page,
    pageCount: Math.max(1, knownPageCount),
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    selectedIds,
    setSelectedIds,
    refresh,
  };
}
