import { NavLink } from "react-router-dom";
import { cx } from "@/lib/cx";

const navItems = [
  ["§ 概览", "/"],
  ["§ 订阅", "/subs"],
  ["§ 凭证", "/tokens"],
  ["§ 中转", "/routes"],
  ["§ 附录", "/logs"],
  ["§ 设置", "/settings"],
] as const;

export function Header(): JSX.Element {
  return (
    <header className="border-b border-rule bg-vellum px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="font-mono text-xs uppercase tracking-widest">AXION · VOL. I · EST. 2026</div>
        <div className="flex items-center gap-2 font-mono text-xs text-mute">
          <span className="h-[6px] w-[6px] bg-cinnabar" aria-hidden="true" />
          <span>核心中转：正常运行</span>
          <span className="text-ink">12ms</span>
        </div>
      </div>
      <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Axion navigation">
        {navItems.map(([label, href]) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              cx(
                "border-b border-transparent pb-1 tracking-wide transition-colors duration-200 hover:border-cinnabar focus:border-cinnabar focus:outline-none",
                isActive && "border-cinnabar text-cinnabar",
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
