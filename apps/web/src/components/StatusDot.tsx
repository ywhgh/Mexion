export type StatusDotProps = {
  variant: "ok" | "alert";
  label?: string;
};

export function StatusDot({ variant, label }: StatusDotProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-mute">
      <span className={variant === "ok" ? "h-[1.5px] w-[1.5px] bg-cinnabar" : "h-[1.5px] w-[1.5px] bg-ink"} />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

