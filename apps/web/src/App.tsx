import { Navigate, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { PaperFrame } from "@/components";
import { DashboardPage } from "@/pages/Dashboard";
import { SettingsPage } from "@/pages/Settings";
import { SignInPage, useMeQuery } from "@/pages/SignIn";
import { SubDetailPage, SubsListPage, SubsNewPage } from "@/pages/Subs";
import { TokensPage } from "@/pages/Tokens";
import { LogsPage } from "@/pages/Logs";
import { RoutesPage } from "@/pages/Routes";

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
            <DashboardPage />
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
            <LogsPage />
          </PaperFrame>
        ),
      },
      {
        path: "/settings",
        element: (
          <PaperFrame>
            <SettingsPage />
          </PaperFrame>
        ),
      },
    ],
  },
]);

export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}





