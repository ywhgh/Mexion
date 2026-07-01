import { create } from "zustand";
import { getLang, persistLang, type Lang } from "../lib/i18n";
import { getTheme, setTheme, type Theme } from "../lib/theme";

export type UiState = {
  rail: boolean;
  theme: Theme;
  lang: Lang;
  setRail: (rail: boolean) => void;
  toggleRail: () => void;
  setTheme: (theme: Theme) => void;
  setLang: (lang: Lang) => void;
};

function initialRail(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem("axion_sidebar_rail") === "1";
}

function persistRail(rail: boolean): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("axion_sidebar_rail", rail ? "1" : "0");
  }
}

export const useUiStore = create<UiState>((set) => ({
  rail: initialRail(),
  theme: getTheme(),
  lang: getLang(),
  setRail: (rail) => {
    persistRail(rail);
    set({ rail });
  },
  toggleRail: () => set((state) => {
    const rail = !state.rail;
    persistRail(rail);
    return { rail };
  }),
  setTheme: (theme) => {
    setTheme(theme);
    set({ theme });
  },
  setLang: (lang) => {
    persistLang(lang);
    set({ lang });
  },
}));
