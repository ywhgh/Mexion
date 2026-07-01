import { useLang } from "../../lib/i18n";
import { useUiStore } from "../../store/ui";

export function LangToggle() {
  const { lang, setLang } = useLang();
  const setStoreLang = useUiStore((state) => state.setLang);
  function choose(next: "zh" | "en"): void {
    setLang(next);
    setStoreLang(next);
  }
  return (
    <div className="lang-toggle" role="group" aria-label="语言">
      <button type="button" data-lang="zh" aria-pressed={lang === "zh"} onClick={() => choose("zh")}>中</button>
      <button type="button" data-lang="en" aria-pressed={lang === "en"} onClick={() => choose("en")}>EN</button>
    </div>
  );
}
