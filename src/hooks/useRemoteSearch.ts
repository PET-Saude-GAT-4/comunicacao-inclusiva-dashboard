"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ListQuery, Paginated } from "@/types/common";

const SEARCH_DEBOUNCE_MS = 300;

type Options = {
  pageSize?: number;
};

type Result<T> = {
  viewKey: string;
  items: T[];
  // The last page appended; 0 when the first one failed.
  page: number;
  pageCount: number;
  failed: boolean;
};

// A server-searched list that grows a page at a time, for lists inside modals
// and pickers. Unlike usePaginatedList, its state lives in the component: a
// picker is opened and closed many times on one page, and none of that belongs
// in the URL.
//
// Pages are appended as they arrive and a new search starts again from page 1.
// A response that belongs to an older search or reload is dropped, so the list
// always matches the text in the field.
export function useRemoteSearch<K extends string, T>(
  key: K,
  fetchPage: (query: ListQuery) => Promise<Paginated<K, T>>,
  { pageSize = 20 }: Options = {},
) {
  const [search, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  // The view a next-page request is loading for, so a stale one never shows
  // a spinner under a newer list.
  const [loadingMoreFor, setLoadingMoreFor] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A fresh token per first-page request rather than the view key, so two
  // requests for the same view (a remount, or a new fetchPage) still drop the
  // older one's response.
  const activeRequest = useRef<object>({});
  // One request at a time: an observer firing again while a page is on its
  // way must not fetch that page twice.
  const busy = useRef(false);

  const viewKey = JSON.stringify([q, version]);
  const current = result?.viewKey === viewKey ? result : null;
  const hasMore = current !== null && current.page < current.pageCount;

  const setSearch = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => setQ(value.trim()),
      SEARCH_DEBOUNCE_MS,
    );
  };

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useEffect(() => {
    const request = {};
    activeRequest.current = request;
    busy.current = true;

    fetchPage({ page: 1, pageSize, q: q || undefined })
      .then((data) => {
        if (activeRequest.current !== request) return;
        setResult({
          viewKey,
          items: data[key],
          page: 1,
          pageCount: data.meta.pageCount,
          failed: false,
        });
      })
      .catch(() => {
        if (activeRequest.current !== request) return;
        setResult({ viewKey, items: [], page: 0, pageCount: 1, failed: true });
      })
      .finally(() => {
        if (activeRequest.current === request) busy.current = false;
      });
  }, [key, fetchPage, pageSize, q, viewKey]);

  const loadMore = useCallback(() => {
    if (busy.current || current === null || current.page === 0) return;
    if (current.page >= current.pageCount) return;

    const view = viewKey;
    const request = activeRequest.current;
    const nextPage = current.page + 1;
    busy.current = true;
    setLoadingMoreFor(view);
    setResult((previous) => previous && { ...previous, failed: false });

    fetchPage({ page: nextPage, pageSize, q: q || undefined })
      .then((data) => {
        if (activeRequest.current !== request) return;
        setResult(
          (previous) =>
            previous && {
              ...previous,
              items: [...previous.items, ...data[key]],
              page: nextPage,
              pageCount: data.meta.pageCount,
            },
        );
      })
      .catch(() => {
        if (activeRequest.current !== request) return;
        setResult((previous) => previous && { ...previous, failed: true });
      })
      .finally(() => {
        if (activeRequest.current === request) busy.current = false;
        setLoadingMoreFor((loading) => (loading === view ? null : loading));
      });
  }, [current, viewKey, fetchPage, pageSize, q, key]);

  // Starts the list over, e.g. after one of its items was removed.
  const reload = useCallback(() => setVersion((count) => count + 1), []);

  // Retrying never happens on its own: a failed page waits for the user.
  const retry = current?.page === 0 ? reload : loadMore;

  return {
    search,
    setSearch,
    items: current?.items ?? [],
    loading: current === null || loadingMoreFor === viewKey,
    error: current?.failed ?? false,
    hasMore,
    loadMore,
    retry,
    reload,
  };
}

export type RemoteSearch<T> = Omit<
  ReturnType<typeof useRemoteSearch<string, T>>,
  "search" | "setSearch"
>;
