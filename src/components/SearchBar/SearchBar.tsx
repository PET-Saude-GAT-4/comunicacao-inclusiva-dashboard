"use client";

import { useEffect, useState } from "react";
import { MdOutlineSearch } from "react-icons/md";

interface SearchBarProps<T> {
  data: T[];
  onResults: (results: T[]) => void;
  getSearchText?: (item: T) => string;
  placeholder?: string;
}

function SearchBar<T>({
  data,
  onResults,
  getSearchText,
  placeholder = "Buscar",
}: SearchBarProps<T>) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const results = normalizedQuery
      ? data.filter((item) => {
          const text = getSearchText
            ? getSearchText(item)
            : JSON.stringify(item);
          return text.toLocaleLowerCase().includes(normalizedQuery);
        })
      : data;

    onResults(results);
  }, [data, getSearchText, onResults, query]);

  return (
    <div className="relative w-full">
      <MdOutlineSearch
        className="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-text-on-primary-variant"
        size={24}
        aria-hidden="true"
      />
      <input
        className="w-full rounded-md border border-outline-common bg-surface-secondary p-md pl-xxl text-body-emph text-text-on-primary placeholder:text-text-on-primary-variant focus:outline-none focus:ring-1 focus:ring-primary-dark"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}

export default SearchBar;
