export type HeatCell = {
  date: string;
  value: number;
};

export type HeatmapProps = {
  cells: HeatCell[];
};

function level(value: number): number {
  if (value <= 0) return 0;
  if (value < 3) return 1;
  if (value < 8) return 2;
  if (value < 16) return 3;
  return 4;
}

export function Heatmap({ cells }: HeatmapProps) {
  const full = Array.from({ length: 91 }, (_, index) => cells[index] ?? { date: `d-${index}`, value: 0 });
  return (
    <div className="hm-cells grid grid-flow-col grid-rows-7 gap-1" role="grid" aria-label="activity heatmap">
      {full.map((cell) => {
        const heat = level(cell.value);
        return (
          <span
            key={cell.date}
            role="gridcell"
            aria-label={`${cell.date}: ${cell.value}`}
            className="h-3 w-3 rounded-xs border border-border-2"
            style={{ backgroundColor: `var(--h${heat})` }}
          />
        );
      })}
    </div>
  );
}
