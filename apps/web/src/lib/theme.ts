export type Theme = "light" | "dark";

const storageKey = "axion_theme";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function getTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(storageKey);
  return isTheme(stored) ? stored : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, theme);
  }
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
