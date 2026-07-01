import { NavLink } from "react-router-dom";
import { useUiStore } from "../../store/ui";
import { StatusDot } from "../ui";
import { cx } from "../../lib/cx";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  { title: "Workspace", items: [
    { label: "Overview", href: "/", icon: "grid" },
    { label: "Subs", href: "/subs", icon: "stack" },
    { label: "Tokens", href: "/tokens", icon: "key" },
    { label: "Routes", href: "/routes", icon: "route" },
    { label: "Logs", href: "/logs", icon: "ledger" },
  ] },
  { title: "Account", items: [
    { label: "Settings", href: "/settings", icon: "settings" },
  ] },
];

function NavIcon({ name }: { name: string }) {
  if (name === "grid") {
    return <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" /><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" /></svg>;
  }
  if (name === "stack") {
    return <svg viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
  }
  if (name === "key") {
    return <svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8.5 8h5M11.5 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
  }
  if (name === "route") {
    return <svg viewBox="0 0 16 16" fill="none"><path d="M3 4h3.5a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="3" cy="4" r="1.4" stroke="currentColor" strokeWidth="1.3" /><circle cx="13" cy="12" r="1.4" stroke="currentColor" strokeWidth="1.3" /></svg>;
  }
  if (name === "ledger") {
    return <svg viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5h11v9h-11zM2.5 7h11" stroke="currentColor" strokeWidth="1.3" /><circle cx="5" cy="5.25" r="0.5" fill="currentColor" /><circle cx="7" cy="5.25" r="0.5" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 16 16" fill="none"><path d="M8 2.5v2M8 11.5v2M3.2 5.2l1.4 1.4M11.4 9.4l1.4 1.4M2.5 8h2M11.5 8h2M3.2 10.8l1.4-1.4M11.4 6.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="8" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

export function Sidebar() {
  const rail = useUiStore((state) => state.rail);
  const toggleRail = useUiStore((state) => state.toggleRail);
  return (
    <aside className="side" aria-label="Axion navigation">
      <div className="side__head">
        <NavLink className="brand" to="/" aria-label="Axion overview">
          <span className="brand__mark" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none"><path d="M14 2.5 25.5 14 14 25.5 2.5 14 14 2.5Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="14" cy="14" r="3" fill="currentColor" /></svg></span>
          <span className="brand__name">Axion</span>
          <span className="brand__plan">PRO</span>
        </NavLink>
      </div>
      <div className="side__body flex flex-1 flex-col gap-2 overflow-hidden">
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <div className="nav-section">{group.title}</div>
            <ul className="nav-list">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) => cx("nav-item", isActive && "is-active")}
                    aria-label={item.label}
                  >
                    {({ isActive }) => (
                      <>
                        <span className="nav-item__icon"><NavIcon name={item.icon} /></span>
                        <span className="nav-item__label">{item.label}</span>
                        {item.badge && <span className="nav-item__badge">{item.badge}</span>}
                        {isActive && <span className="sr-only">current</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="Other">
          <div className="nav-section">Other</div>
          <a className="nav-item" href="https://axiomcode.dev" target="_blank" rel="noreferrer">
            <span className="nav-item__icon"><svg viewBox="0 0 16 16" fill="none"><path d="M6.5 3H3v10h10V9.5M9 3h4v4M7 9l5.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span className="nav-item__label">Docs</span>
          </a>
        </nav>
        <div className="side__foot">
          <span className="side__foot-dot" aria-hidden="true" />
          <div className="min-w-0">
            <p className="side__foot-title">Core relay</p>
            <StatusDot tone="ok" label="Live" />
          </div>
        </div>
      </div>
      <button type="button" className="side__collapse" aria-label={rail ? "展开侧栏" : "收起侧栏"} onClick={toggleRail}>
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </aside>
  );
}
