import { useMemo, useState } from "react";
import CopyableUuid from "../CopyableUuid/CopyableUuid";
import Pagination from "../Pagination/Pagination";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

function Table<T extends { id: number } | { uuid: string }>({
  data,
  columns,
  pageSize = 10,
  onSelectionChange,
  onRowClick,
}: {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onSelectionChange?: (ids: (number | string)[]) => void;
  onRowClick?: (row: T) => void;
}) {
  const [selected, setSelected] = useState<(number | string)[]>([]);
  const [page, setPage] = useState(1);

  const rowKey = (row: T): number | string => ("id" in row ? row.id : row.uuid);

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const updateSelection = (next: (number | string)[]) => {
    setSelected(next);
    onSelectionChange?.(next);
  };

  // Select-all now scopes to the visible page, not the whole dataset —
  // ticking the header checkbox on page 2 shouldn't silently select page 1's rows too.
  const pageKeys = pageData.map(rowKey);
  const pageAllSelected =
    pageData.length > 0 && pageKeys.every((k) => selected.includes(k));

  const toggleAll = () => {
    const next = pageAllSelected
      ? selected.filter((k) => !pageKeys.includes(k))
      : [...new Set([...selected, ...pageKeys])];
    updateSelection(next);
  };

  const toggleRow = (key: number | string) => {
    const next = selected.includes(key)
      ? selected.filter((s) => s !== key)
      : [...selected, key];
    updateSelection(next);
  };

  return (
    <div className="flex flex-col bg-surface-primary font-semibold h-fit overflow-hidden">
      <div className="overflow-hidden border border-outline-common rounded-md flex flex-col flex-1">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8EEEC]">
              <th className="w-10 border-b border-outline-common py-md text-center">
                <input
                  type="checkbox"
                  checked={pageAllSelected}
                  onChange={toggleAll}
                  className="accent-primary"
                />
              </th>
              <th>
                <span className="">Código de Identificação</span>
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="border-b border-outline-common px-sm py-sm font-semibold text-text-secondary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-lg text-center text-text-secondary"
                >
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {pageData.map((row, i) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "border-b border-outline-common last:border-b-0 transition-colors",
                    i % 2 === 1 ? "bg-[#F1F6F4]" : "",
                    onRowClick
                      ? "cursor-pointer hover:bg-surface-secondary/70"
                      : "",
                  ].join(" ")}
                >
                  <td
                    className="px-lg py-xl text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(key)}
                      onChange={() => toggleRow(key)}
                      className="accent-primary"
                    />
                  </td>
                  <td>
                    <CopyableUuid uuid={String(key)} />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-sm py-sm text-text-on-primary"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center border-t border-outline-common py-sm bg-surface-primary">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={(nextPage) =>
              setPage(Math.min(Math.max(1, nextPage), pageCount))
            }
          />
        </div>
      )}
    </div>
  );
}

export default Table;
