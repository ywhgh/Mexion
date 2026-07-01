import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const admin = useAuthStore((state) => state.admin);
  const clear = useAuthStore((state) => state.clear);
  const name = admin?.username ?? "operator";

  function signOut(): void {
    void fetch("/api/auth/sign-out", { method: "POST" })
      .then(() => undefined, () => undefined)
      .finally(() => {
        clear();
        navigate("/sign-in", { replace: true });
      });
  }

  return (
    <div className="user-menu">
      <button type="button" className="user" aria-haspopup="menu" aria-expanded={open} aria-controls="user-menu-panel" onClick={() => setOpen((value) => !value)}>
        <span className="user__avatar">{name.slice(0, 1).toUpperCase()}</span>
        <span className="user__name">{name}</span>
        <svg className="user__caret" width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="2.5,4 5,6.5 7.5,4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="user-menu__panel" id="user-menu-panel" role="menu" aria-label="账户菜单">
          <div className="user-menu__head">
            <div className="user-menu__avatar-lg">{name.slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="user-menu__name">{name}</div>
              <div className="user-menu__id">single admin</div>
            </div>
          </div>
          <div className="user-menu__list">
            <button type="button" role="menuitem" className="user-menu__item" onClick={() => setOpen(false)}>个人资料</button>
            <button type="button" role="menuitem" className="user-menu__item" onClick={() => { setOpen(false); navigate("/tokens"); }}>API 密钥</button>
            <div className="user-menu__sep" />
            <button type="button" role="menuitem" className="user-menu__item user-menu__item--danger" onClick={signOut}>退出登录</button>
          </div>
        </div>
      )}
    </div>
  );
}
