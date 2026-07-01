import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "zh" | "en";
export type Dict = Record<Lang, Record<string, string>>;

const storageKey = "axion_lang";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, dict?: Dict) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

function isLang(value: string | null): value is Lang {
  return value === "zh" || value === "en";
}

export function getLang(): Lang {
  if (typeof window === "undefined") {
    return "zh";
  }
  const stored = window.localStorage.getItem(storageKey);
  return isLang(stored) ? stored : "zh";
}

export function persistLang(lang: Lang): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, lang);
  }
  if (typeof document !== "undefined") {
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }
}

export function t(key: string, lang: Lang = getLang(), dict?: Dict): string {
  return dict?.[lang]?.[key] ?? dict?.zh?.[key] ?? key;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => getLang());

  useEffect(() => {
    persistLang(lang);
  }, [lang]);

  const value = useMemo<LangContextValue>(() => ({
    lang,
    setLang: setLangState,
    t: (key, dict) => t(key, lang, dict),
  }), [lang]);

  return createElement(LangContext.Provider, { value }, children);
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext);
  if (!value) {
    return {
      lang: getLang(),
      setLang: persistLang,
      t: (key, dict) => t(key, getLang(), dict),
    };
  }
  return value;
}

export function useT(dict?: Dict): (key: string) => string {
  const { lang } = useLang();
  return (key: string) => t(key, lang, dict);
}
