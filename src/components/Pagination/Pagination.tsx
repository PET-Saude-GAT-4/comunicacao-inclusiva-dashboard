import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-md py-sm text-body-emph">
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
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={[
                "grid h-8 min-w-8 place-items-center rounded-sm px-2 text-body transition-colors",
                pageNumber === page
                  ? "font-bold text-primary-dark"
                  : "font-regular text-text-on-primary-variant hover:bg-surface-secondary",
              ].join(" ")}
            >
              {pageNumber}
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
    </div>
  );
}
