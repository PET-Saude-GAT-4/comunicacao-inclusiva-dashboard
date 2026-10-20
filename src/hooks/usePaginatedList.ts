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
// The selection lives here because it has to be dropped whenever the visible
// rows change: a bulk delete must never reach rows the user can no longer see.
// Pass listKey as the key of an uncontrolled Table so its own checkboxes reset
// along with it.
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

  const [search, setSearchInput] = useState(q);
  const [result, setResult] = useState<{ items: T[]; meta: PageMeta } | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [version, setVersion] = useState(0);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  const setPage = (nextPage: number) => {
    const pageCount = result?.meta.pageCount ?? nextPage;
    updateUrl({
      page: Math.min(Math.max(1, nextPage), Math.max(1, pageCount)),
    });
    setSelectedIds([]);
  };

  const setSearch = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      updateUrl({ q: value.trim(), page: undefined });
      setSelectedIds([]);
    }, SEARCH_DEBOUNCE_MS);
  };

  const setFilter = (name: string, value: string | undefined) => {
    updateUrl({ [name]: value, page: undefined });
    setSelectedIds([]);
  };

  const refresh = () => {
    setVersion((current) => current + 1);
    setSelectedIds([]);
  };

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useEffect(() => {
    let cancelled = false;

    fetchPage({ page, pageSize, q: q || undefined }, JSON.parse(filtersKey))
      .then((data) => {
        if (cancelled) return;
        // A page left empty, by a delete or by a stale link, falls back to
        // the last page that still has rows.
        if (data[key].length === 0 && page > 1) {
          updateUrl({ page: Math.max(1, data.meta.pageCount) });
          return;
        }
        setResult({ items: data[key], meta: data.meta });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [key, fetchPage, page, pageSize, q, filtersKey, version, updateUrl]);

  return {
    items: result?.items ?? [],
    loaded: result !== null,
    page,
    pageCount: Math.max(1, result?.meta.pageCount ?? 1),
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    selectedIds,
    setSelectedIds,
    refresh,
    listKey: `${page}|${q}|${filtersKey}|${version}`,
  };
}
