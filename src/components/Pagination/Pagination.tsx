import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

type Entry = { kind: "page"; page: number } | { kind: "gap"; after: number };

// The first page, the last page and the current page's neighbours, with a gap
// marker for each stretch left out. A stretch of a single page shows that page
// instead: the marker would take the same room and hide it for nothing.
function buildPages(page: number, pageCount: number): Entry[] {
  const shown = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...shown]
    .filter((candidate) => candidate >= 1 && candidate <= pageCount)
    .sort((a, b) => a - b);

  const entries: Entry[] = [];
  sorted.forEach((current, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && current - previous === 2) {
      entries.push({ kind: "page", page: previous + 1 });
    } else if (previous !== undefined && current - previous > 2) {
      entries.push({ kind: "gap", after: previous });
    }
    entries.push({ kind: "page", page: current });
  });

  return entries;
}

export default function Pagination({ page, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-center gap-1 bg-gray-100 rounded-md py-sm text-body-emph"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <MdChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-0.5">
        {buildPages(page, pageCount).map((entry) =>
          entry.kind === "gap" ? (
            <span
              key={`gap-${entry.after}`}
              aria-hidden="true"
              className="grid h-8 min-w-8 place-items-center px-2 text-body text-text-on-primary-variant"
            >
              …
            </span>
          ) : (
            <button
              key={entry.page}
              type="button"
              onClick={() => onPageChange(entry.page)}
              aria-label={`Página ${entry.page}`}
              aria-current={entry.page === page ? "page" : undefined}
              className={[
                "grid h-8 min-w-8 place-items-center rounded-sm px-2 text-body transition-colors",
                entry.page === page
                  ? "font-bold text-primary-dark"
                  : "font-regular text-text-on-primary-variant hover:bg-surface-secondary",
              ].join(" ")}
            >
              {entry.page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Próxima página"
        className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <MdChevronRight size={20} />
      </button>
    </nav>
  );
}
