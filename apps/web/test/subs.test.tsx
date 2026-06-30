/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubsNewPage } from "../src/pages/Subs";

function renderSubsNew(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/subs/new"]}>
        <SubsNewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("subscription new form", () => {
  it("submits raw sources and renders the generated output url", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("/api/subs");
      expect(init?.method).toBe("POST");
      expect(String(init?.body)).toContain("vmess://demo");
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            sub: {
              id: 7,
              name: "Daily",
              rawSources: ["vmess://demo"],
              target: "clash-meta",
              ruleSet: "none",
              renamePrefix: "AXION",
              filterRegex: "",
              createdAt: "now",
              updatedAt: "now",
              tokens: [{ id: 1, name: "Daily endpoint", prefix: "ax_12345", usedBytes: 0, quotaBytes: null }],
            },
            secret: "ax_1234567890",
            outputUrl: "http://127.0.0.1:8787/v1/sub?token=ax_1234567890",
          },
        }),
        { headers: { "content-type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    renderSubsNew();

    await userEvent.type(screen.getByLabelText("案卷名称"), "Daily");
    await userEvent.type(screen.getByPlaceholderText("vmess://..."), "vmess://demo");
    await userEvent.type(screen.getByLabelText("自定义命名前缀"), "AXION");
    await userEvent.click(screen.getByRole("button", { name: "生成公理化终点" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("http://127.0.0.1:8787/v1/sub?token=ax_1234567890")).toBeInTheDocument();
  });
});

