/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignInPage } from "../src/pages/SignIn";

function renderAuth(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/sign-in"]}>
        <SignInPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sign-in flow", () => {
  it("submits bootstrap credentials when no admin exists", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/auth/me") {
        return new Response(JSON.stringify({ ok: true, data: { bootstrapped: false, admin: null } }), {
          headers: { "content-type": "application/json" },
        });
      }
      expect(path).toBe("/api/auth/bootstrap");
      expect(init?.method).toBe("POST");
      return new Response(
        JSON.stringify({ ok: true, data: { admin: { id: 1, username: "operator", createdAt: "now" } } }),
        { headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    renderAuth();

    await screen.findByText("§ 初始化管理员");
    await userEvent.type(screen.getByLabelText("管理员"), "operator");
    await userEvent.type(screen.getByLabelText("密钥"), "long-password");
    await userEvent.click(screen.getByRole("button", { name: "钤定管理员" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/auth/bootstrap", expect.objectContaining({ method: "POST" })));
  });
});
