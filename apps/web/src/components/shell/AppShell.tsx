import { Outlet } from "react-router-dom";
import { useUiStore } from "../../store/ui";
import { CornerMarks } from "./CornerMarks";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cx } from "../../lib/cx";

export function AppShell() {
  const rail = useUiStore((state) => state.rail);
  return (
    <div className={cx("app", rail && "is-rail")}>
      <Sidebar />
      <main className="main min-w-0">
        <Topbar />
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-12 pt-0 lg:px-8">
          <Outlet />
        </div>
      </main>
      <CornerMarks />
    </div>
  );
}
