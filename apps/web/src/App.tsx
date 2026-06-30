import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PaperFrame } from "@/components";
import { Demo } from "@/pages/Demo";

function Placeholder({ title }: { title: string }): JSX.Element {
  return (
    <div className="border border-rule bg-paper p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-mute">PL. 待刊</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold tracking-wide">{title}</h1>
      <p className="mt-3 max-w-[70ch] text-sm leading-6 text-mute">案卷已编号，正文将在后续里程碑写入。</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PaperFrame>
        <Demo />
      </PaperFrame>
    ),
  },
  {
    path: "/subs",
    element: (
      <PaperFrame>
        <Placeholder title="§ 订阅 · PL. I" />
      </PaperFrame>
    ),
  },
  {
    path: "/tokens",
    element: (
      <PaperFrame>
        <Placeholder title="§ 凭证 · PL. II" />
      </PaperFrame>
    ),
  },
  {
    path: "/routes",
    element: (
      <PaperFrame>
        <Placeholder title="§ 中转 · PL. III" />
      </PaperFrame>
    ),
  },
  {
    path: "/logs",
    element: (
      <PaperFrame>
        <Placeholder title="§ 附录 · PL. IV" />
      </PaperFrame>
    ),
  },
  {
    path: "/settings",
    element: (
      <PaperFrame>
        <Placeholder title="§ 设置" />
      </PaperFrame>
    ),
  },
]);

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
