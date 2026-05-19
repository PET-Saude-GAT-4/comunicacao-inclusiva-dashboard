import { useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

function Table<T extends { id: number } | { uuid: string }>({
  data,
  columns,
  onSelectionChange,
  onRowClick,
}: {
  data: T[];
  columns: Column<T>[];
  onSelectionChange?: (ids: (number | string)[]) => void;
  onRowClick?: (row: T) => void;
}) {
  const [selected, setSelected] = useState<(number | string)[]>([]);

  const rowKey = (row: T): number | string => ("id" in row ? row.id : row.uuid);

  const updateSelection = (next: (number | string)[]) => {
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    const next = selected.length === data.length ? [] : data.map(rowKey);
    updateSelection(next);
  };

  const toggleRow = (key: number | string) => {
    const next = selected.includes(key)
      ? selected.filter((s) => s !== key)
      : [...selected, key];
    updateSelection(next);
  };

  return (
    <table className="text-text-on-primary w-full text-left">
      <thead className="bg-surface-secondary">
        <tr>
          <th className="border-r border-b  border-outline-common py-sm text-center">
            <input
              type="checkbox"
              checked={data.length > 0 && selected.length === data.length}
              onChange={toggleAll}
            />
          </th>
          {columns.map((col) => (
            <th
              className="border-r border-b border-outline-common px-sm"
              key={String(col.key)}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr
            className={`border-b border-outline-common${onRowClick ? " cursor-pointer hover:bg-surface-secondary" : ""}`}
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
          >
            <td className="py-sm px-sm border-r text-center border-outline-common">
              <input
                type="checkbox"
                checked={selected.includes(rowKey(row))}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  toggleRow(rowKey(row));
                }}
              />
            </td>
            {columns.map((col) => (
              <td
                className="py-sm px-sm border-r border-outline-common"
                key={String(col.key)}
              >
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
