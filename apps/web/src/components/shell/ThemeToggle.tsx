import { useUiStore } from "../../store/ui";

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className="theme-toggle" aria-label="切换主题" onClick={() => setTheme(next)}>
      <svg className="ic-sun" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
      <svg className="ic-moon" viewBox="0 0 16 16" fill="none"><path d="M12.5 10.7A5.4 5.4 0 0 1 5.3 3.5a5.6 5.6 0 1 0 7.2 7.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
    </button>
  );
}
