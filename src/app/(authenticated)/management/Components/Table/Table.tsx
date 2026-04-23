import { useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

function Table<T extends { id: number }>({
  data,
  columns,
  onSelectionChange,
}: {
  data: T[];
  columns: Column<T>[];
  onSelectionChange?: (ids: number[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);

  const updateSelection = (next: number[]) => {
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    const next = selected.length === data.length ? [] : data.map((r) => r.id);
    updateSelection(next);
  };

  const toggleRow = (id: number) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
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
          <tr className="border-b border-outline-common" key={row.id}>
            <td className="py-sm px-sm border-r text-center border-outline-common">
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggleRow(row.id)}
              />
            </td>
            {columns.map((col) => (
              <td
                className="py-sm px-sm border-r border-outline-common"
                key={String(col.key)}
              >
                {String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
