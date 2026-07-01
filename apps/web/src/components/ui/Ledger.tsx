import type { ReactNode } from "react";
import { cx } from "../../lib/cx";

export type LedgerColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
};

export type LedgerProps<T> = {
  columns: Array<LedgerColumn<T>>;
  rows: T[];
  empty?: ReactNode;
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
};

export function Ledger<T>({ columns, rows, empty = "暂无记录", getRowKey, onRowClick }: LedgerProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border-2 bg-surface-2 font-mono text-[11px] uppercase tracking-[0.12em] text-mute-2">
            {columns.map((column) => <th key={column.key} className={cx("px-4 py-3 font-medium", column.className)}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="px-4 py-8 text-center text-muted" colSpan={columns.length}>{empty}</td></tr>
          ) : rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cx("border-b border-border-2 transition hover:bg-verm-tint", onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => <td key={column.key} className={cx("px-4 py-3 align-top", column.className)}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
