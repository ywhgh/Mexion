import type { ReactNode } from "react";

export type TableLedgerColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

export type TableLedgerProps<T> = {
  columns: Array<TableLedgerColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string | number;
  empty?: string;
};

export function TableLedger<T>({ columns, rows, getRowKey, empty }: TableLedgerProps<T>): JSX.Element {
  return (
    <div className="overflow-x-auto border border-rule">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-vellum font-mono text-xs uppercase tracking-widest text-mute">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-rule px-3 py-3 font-medium" key={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center font-serif text-mute" colSpan={columns.length}>
                {empty ?? "案卷未启，待第一笔墨迹落下。"}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr className="border-b border-dashed border-mute last:border-b-0" key={getRowKey(row)}>
                {columns.map((column) => (
                  <td className="px-3 py-3 align-top" key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
