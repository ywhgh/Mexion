import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/shell";
import { Dashboard } from "./pages/Dashboard";
import { SignIn } from "./pages/SignIn";
import { SubsDetail } from "./pages/subs/Detail";
import { SubsList } from "./pages/subs/List";
import { SubsNew } from "./pages/subs/New";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

function Placeholder({ title }: { title: string }) {
  return (
    <div className="page-head fade-in fade-in--1">
      <div>
        <nav className="page-head__crumb"><span>AXION</span><span className="sep">/</span><span>{title}</span></nav>
        <h1 className="page-head__title">{title} <em>folio</em></h1>
        <p className="page-head__sub">This plate will be completed in the next milestone.</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="subs" element={<SubsList />} />
            <Route path="subs/new" element={<SubsNew />} />
            <Route path="subs/:id" element={<SubsDetail />} />
            <Route path="tokens" element={<Placeholder title="Tokens" />} />
            <Route path="routes" element={<Placeholder title="Routes" />} />
            <Route path="logs" element={<Placeholder title="Logs" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


