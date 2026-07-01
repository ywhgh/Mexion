export type SparkProps = {
  values: number[];
  label?: string;
};

function points(values: number[]): string {
  const safe = values.length > 1 ? values : [0, 0];
  const max = Math.max(...safe, 1);
  return safe.map((value, index) => {
    const x = (index / (safe.length - 1)) * 100;
    const y = 28 - (value / max) * 24;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function Spark({ values, label = "sparkline" }: SparkProps) {
  return (
    <svg role="img" aria-label={label} viewBox="0 0 100 32" className="h-8 w-28 text-verm">
      <polyline points={points(values)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.3" />
    </svg>
  );
}
