import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/shell";
import { Dashboard } from "./pages/Dashboard";
import { Logs } from "./pages/Logs";
import { Routes as RoutesPage } from "./pages/Routes";
import { Settings } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { SubsDetail } from "./pages/subs/Detail";
import { SubsList } from "./pages/subs/List";
import { SubsNew } from "./pages/subs/New";
import { Tokens } from "./pages/Tokens";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

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
            <Route path="tokens" element={<Tokens />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}






