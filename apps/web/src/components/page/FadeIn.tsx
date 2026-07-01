import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";

export type FadeInProps = HTMLAttributes<HTMLDivElement> & {
  step?: 1 | 2 | 3 | 4 | 5;
};

export function FadeIn({ step = 1, className, ...props }: FadeInProps) {
  return <div {...props} className={cx("fade-in", `fade-in--${step}`, className)} />;
}
