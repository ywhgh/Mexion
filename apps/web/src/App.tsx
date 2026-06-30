import { Navigate, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { PaperFrame } from "@/components";
import { Demo } from "@/pages/Demo";
import { SignInPage, SignOutButton, useMeQuery } from "@/pages/SignIn";
import { SubDetailPage, SubsListPage, SubsNewPage } from "@/pages/Subs";
import { TokensPage } from "@/pages/Tokens";
import { RoutesPage } from "@/pages/Routes";

function Placeholder({ title }: { title: string }): JSX.Element {
  return (
    <div className="border border-rule bg-paper p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-mute">PL. 待刊</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold tracking-wide">{title}</h1>
      <p className="mt-3 max-w-[70ch] text-sm leading-6 text-mute">案卷已编号，正文将在后续里程碑写入。</p>
      <div className="mt-5">
        <SignOutButton />
      </div>
    </div>
  );
}

function ProtectedShell(): JSX.Element {
  const me = useMeQuery();

  if (me.isLoading) {
    return (
      <PaperFrame>
        <div className="border border-rule bg-paper p-6 font-mono text-sm uppercase tracking-widest text-mute">
          LOADING AXION INDEX
        </div>
      </PaperFrame>
    );
  }

  if (!me.data?.bootstrapped || !me.data.admin) {
    return <Navigate replace to="/sign-in" />;
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    element: <ProtectedShell />,
    children: [
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
            <SubsListPage />
          </PaperFrame>
        ),
      },
      {
        path: "/subs/new",
        element: (
          <PaperFrame>
            <SubsNewPage />
          </PaperFrame>
        ),
      },
      {
        path: "/subs/:id",
        element: (
          <PaperFrame>
            <SubDetailPage />
          </PaperFrame>
        ),
      },
      {
        path: "/tokens",
        element: (
          <PaperFrame>
            <TokensPage />
          </PaperFrame>
        ),
      },
      {
        path: "/routes",
        element: (
          <PaperFrame>
            <RoutesPage />
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
    ],
  },
]);

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}


