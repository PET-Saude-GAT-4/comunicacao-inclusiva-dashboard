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
  // False when the first page failed, so retrying starts the list over.
  loaded: boolean;
  total: number;
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
//
// The API pages by offset, so removing an item shifts every later one up by
// one. The next request therefore starts at the number of items on screen,
// not at the next page number, which keeps the item that moved into an
// already loaded page from being skipped.
export function useRemoteSearch<K extends string, T extends { uuid: string }>(
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
  const hasMore =
    current !== null && current.loaded && current.items.length < current.total;

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
          loaded: true,
          total: data.meta.total,
          failed: false,
        });
      })
      .catch(() => {
        if (activeRequest.current !== request) return;
        setResult({ viewKey, items: [], loaded: false, total: 0, failed: true });
      })
      .finally(() => {
        if (activeRequest.current === request) busy.current = false;
      });
  }, [key, fetchPage, pageSize, q, viewKey]);

  const loadMore = useCallback(() => {
    if (busy.current || current === null || !current.loaded) return;
    if (current.items.length >= current.total) return;

    const view = viewKey;
    const request = activeRequest.current;
    const offset = current.items.length;
    const page = Math.floor(offset / pageSize) + 1;
    // Only after a removal does the offset fall inside a page; the rest of
    // that page is then not enough to fill a page, so the next one comes too.
    const skip = offset % pageSize;
    const pages =
      skip > 0 && page < Math.ceil(current.total / pageSize)
        ? [page, page + 1]
        : [page];
    busy.current = true;
    setLoadingMoreFor(view);
    setResult((previous) => previous && { ...previous, failed: false });

    // Both pages are asked for at once: the client runs Server Functions one
    // at a time, so a removal sent meanwhile cannot land between them and
    // shift the second page against the first.
    Promise.all(
      pages.map((number) =>
        fetchPage({ page: number, pageSize, q: q || undefined }),
      ),
    )
      .then((responses) => ({
        ...responses[responses.length - 1],
        [key]: responses.flatMap((data) => data[key]),
      }))
      .then((data) => {
        if (activeRequest.current !== request) return;
        setResult((previous) => {
          if (!previous) return previous;
          const shown = new Set(previous.items.map((item) => item.uuid));
          const added = data[key]
            .slice(skip)
            .filter((item) => !shown.has(item.uuid));
          return {
            ...previous,
            items: [...previous.items, ...added],
            // A page with nothing new means the list changed elsewhere since
            // it was loaded; ending it here keeps the observer from asking
            // for the same page forever.
            total:
              added.length > 0
                ? data.meta.total
                : previous.items.length,
          };
        });
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

  // Starts the list over, losing the pages already loaded.
  const reload = useCallback(() => setVersion((count) => count + 1), []);

  // Drops an item the server no longer has, keeping the rest of the list and
  // its scroll position in place.
  const remove = useCallback((uuid: string) => {
    setResult((previous) => {
      if (!previous?.items.some((item) => item.uuid === uuid)) return previous;
      return {
        ...previous,
        items: previous.items.filter((item) => item.uuid !== uuid),
        total: previous.total - 1,
      };
    });
  }, []);

  // Retrying never happens on its own: a failed page waits for the user.
  const retry = current?.loaded === false ? reload : loadMore;

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
    remove,
  };
}

export type RemoteSearch<T extends { uuid: string }> = Omit<
  ReturnType<typeof useRemoteSearch<string, T>>,
  "search" | "setSearch"
>;
