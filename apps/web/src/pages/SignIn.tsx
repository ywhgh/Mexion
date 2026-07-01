import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LangToggle } from "../components/shell";
import { Checkbox, Field } from "../components/ui";
import { apiFetch, jsonBody } from "../lib/api";
import { useLang } from "../lib/i18n";
import { useAuthStore, type Admin } from "../store/auth";

type MeData = {
  bootstrapped: boolean;
  admin: Admin | null;
};

type AuthData = {
  admin: Admin;
};

const dict = {
  zh: {
    thesis: "§ The Thesis",
    hero1: "一把钥匙，",
    hero2: "通往所有可审计的",
    hero3: "订阅终点",
    sub: "Axion 把订阅转换、令牌配额与中转日志整理为一张可操作的技术版面。所有调用从此有据可查。",
    status: "状态",
    statusValue: "核心中转可用",
    modeLogin: "§ 登录",
    modeRegister: "§ 注册",
    titleLogin: "欢迎回来",
    titleRegister: "建立管理员",
    ledeLogin: "用单管理员密钥进入控制台。",
    ledeRegister: "首次运行需要钤定唯一管理员。",
    username: "管理员",
    password: "密钥",
    remember: "记住这台设备",
    submitLogin: "进入控制台",
    submitRegister: "钤定管理员",
    google: "Google 占位",
    github: "GitHub 占位",
    divider: "或使用本地管理员",
  },
  en: {
    thesis: "§ The Thesis",
    hero1: "One key,",
    hero2: "for every auditable",
    hero3: "subscription endpoint",
    sub: "Axion turns subscription conversion, token quota, and relay logs into one operable technical folio.",
    status: "Status",
    statusValue: "Core relay online",
    modeLogin: "§ Sign in",
    modeRegister: "§ Register",
    titleLogin: "Welcome back",
    titleRegister: "Create admin",
    ledeLogin: "Enter the console with the single administrator secret.",
    ledeRegister: "First run needs one sealed administrator.",
    username: "Administrator",
    password: "Secret",
    remember: "Remember this device",
    submitLogin: "Enter console",
    submitRegister: "Seal administrator",
    google: "Google placeholder",
    github: "GitHub placeholder",
    divider: "Or use local administrator",
  },
};

function ScrollKeeper() {
  return (
    <svg viewBox="0 0 220 220" aria-label="持卷者" className="plate__fig-img">
      <path d="M65 174c20 10 70 10 90 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.18" />
      <path d="M86 74c6-20 42-20 48 0 4 15-4 30-24 30S82 89 86 74Z" fill="var(--surface-2)" stroke="currentColor" strokeWidth="2" />
      <path d="M66 148c8-34 28-52 44-52s36 18 44 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="58" y="122" width="104" height="38" rx="0" fill="var(--surface)" stroke="currentColor" strokeWidth="2" />
      <path d="M72 136h60M72 147h42" stroke="var(--verm)" strokeWidth="2" strokeLinecap="round" />
      <path d="M151 80l16 16-16 16-16-16 16-16Z" fill="var(--verm-soft)" stroke="var(--verm)" strokeWidth="2" />
      <circle cx="151" cy="96" r="5" fill="var(--verm)" />
    </svg>
  );
}

export function SignIn() {
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [bootstrapped, setBootstrapped] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const mode = bootstrapped ? "login" : "register";

  useEffect(() => {
    let alive = true;
    apiFetch<MeData>("/api/auth/me")
      .then((data) => {
        if (!alive) return;
        setBootstrapped(data.bootstrapped);
        setAuth({ admin: data.admin, bootstrapped: data.bootstrapped });
        if (data.admin) {
          navigate("/", { replace: true });
        }
      })
      .catch((reason: unknown) => {
        if (alive) setError(reason instanceof Error ? reason.message : "Auth probe failed");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [navigate, setAuth]);

  const title = useMemo(() => {
    const raw = mode === "login" ? t("titleLogin", dict) : t("titleRegister", dict);
    if (lang === "zh") {
      const mark = mode === "login" ? "回来" : "管理员";
      return <>{raw.replace(mark, "")}<em>{mark}</em></>;
    }
    const words = raw.split(" ");
    const last = words.pop() ?? raw;
    return <>{words.join(" ")} <em>{last}</em></>;
  }, [lang, mode, t]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const endpoint = bootstrapped ? "/api/auth/sign-in" : "/api/auth/bootstrap";
      const data = await apiFetch<AuthData>(endpoint, {
        method: "POST",
        body: jsonBody({ username, password }),
      });
      setAuth({ admin: data.admin, bootstrapped: true });
      navigate("/", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page" data-lang={lang}>
      <div className="cm cm-tl" aria-hidden="true" />
      <div className="cm cm-tr" aria-hidden="true" />
      <div className="cm cm-bl" aria-hidden="true" />
      <div className="cm cm-br" aria-hidden="true" />
      <aside className="plate">
        <div className="plate-binding" aria-hidden="true" />
        <header className="plate__head">
          <a className="plate__brand" href="/sign-in"><span className="plate__brand-mark" aria-hidden="true" /><span>Axion</span></a>
          <span className="plate__meta">Vol. I · Issue 01</span>
        </header>
        <div className="plate__rule" />
        <div className="plate__body">
          <div className="plate__inner">
            <div>
              <p className="plate__sec-label">{t("thesis", dict)}</p>
              <h1 className="plate__hero">
                <span>{t("hero1", dict)}</span><br />
                <span>{t("hero2", dict)}</span><br />
                <span className="plate__hero-mark">{t("hero3", dict)}</span>
              </h1>
              <p className="plate__sub">{t("sub", dict)}</p>
            </div>
            <figure className="plate__fig">
              <div className="plate__fig-cap">PL. I</div>
              <ScrollKeeper />
              <figcaption className="plate__fig-name"><span>持卷者</span>The Keeper of the Scroll</figcaption>
            </figure>
          </div>
        </div>
        <footer className="plate__foot">
          <span><span className="s-key">{t("status", dict)}</span><span className="s-dot" /> <span className="s-val">{t("statusValue", dict)}</span></span>
          <span className="plate__foot-spacer" />
          <span>SQLite · Hono · React</span>
        </footer>
      </aside>
      <main className="form-wrap">
        <div className="form-top"><LangToggle /></div>
        <div className="form-card-wrap">
          <form className="form-card" data-mode={mode} onSubmit={(event) => { void submit(event); }}>
            <p className="form__eyebrow">{mode === "login" ? t("modeLogin", dict) : t("modeRegister", dict)}</p>
            <h2 className="form__title">{title}</h2>
            <p className="form__lede">{mode === "login" ? t("ledeLogin", dict) : t("ledeRegister", dict)}</p>
            <div className="sso-row" aria-label="SSO placeholders">
              <button type="button" className="sso-btn" disabled>{t("google", dict)}</button>
              <button type="button" className="sso-btn" disabled>{t("github", dict)}</button>
            </div>
            <div className="divider"><span>{t("divider", dict)}</span></div>
            <Field label={t("username", dict)} num="01" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required disabled={loading || submitting} />
            <Field label={t("password", dict)} num="02" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={bootstrapped ? "current-password" : "new-password"} required minLength={8} disabled={loading || submitting} />
            <div className="options-row">
              <Checkbox label={t("remember", dict)} defaultChecked />
              {error && <span className="form-error" role="alert">{error}</span>}
            </div>
            <button className="submit-btn" type="submit" disabled={loading || submitting}>
              <span className="submit-btn__ornament" aria-hidden="true" />
              <span className="submit-btn__text">{submitting ? "..." : mode === "login" ? t("submitLogin", dict) : t("submitRegister", dict)}</span>
              <svg className="submit-btn__arrow" width="18" height="12" viewBox="0 0 18 12" fill="none"><path d="M1 6h15M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
        <footer className="colophon"><span>AXION</span><span className="colophon__center">§ LOCAL FIRST CONTROL PLANE</span><span>MMXXVI</span></footer>
      </main>
    </div>
  );
}

export const SignInPage = SignIn;
