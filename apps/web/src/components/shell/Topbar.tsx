import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { IconBtn } from "../ui";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__spacer" />
      <div className="topbar__sep" aria-hidden="true" />
      <LangToggle />
      <ThemeToggle />
      <IconBtn label="通知" className="iconbtn--labeled">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 0 1 8 0c0 2 1 3.5 1.5 4.5H2.5C3 9.5 4 8 4 6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        <span className="hidden sm:inline">通知</span>
      </IconBtn>
      <UserMenu />
    </header>
  );
}
