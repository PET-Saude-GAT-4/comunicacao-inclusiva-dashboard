import { useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

function Table<T extends { id: number }>({
  data,
  columns,
}: {
  data: T[];
  columns: Column<T>[];
}) {
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <table className="text-text-on-primary w-full text-left">
      <thead className="bg-surface-secondary">
        <tr>
          <th className="border-r border-b  border-outline-common py-sm text-center">
            <input type="checkbox" />
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
              <input type="checkbox" />
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
