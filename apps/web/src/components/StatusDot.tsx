export type StatusDotProps = {
  variant: "ok" | "alert";
  label?: string;
};

export function StatusDot({ variant, label }: StatusDotProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-mute">
      <span className={variant === "ok" ? "h-[6px] w-[6px] bg-cinnabar" : "h-[6px] w-[6px] bg-ink"} />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
