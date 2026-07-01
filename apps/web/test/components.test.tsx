/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, Card, Checkbox, Chip, Field, Heatmap, IconBtn, Ledger, Modal, MonoCode, Pill, Select, Spark, StatusDot, Tab, Tabs, TextArea } from "../src/components/ui";

describe("axiom ui primitives", () => {
  it("renders card, button, pill and chip roles", () => {
    render(
      <Card title="控制台" actions={<Button variant="primary">新建</Button>}>
        <Pill tone="ok">在线</Pill>
        <Chip pressed count={2}>凭证</Chip>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "控制台" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "凭证 2" })).toHaveAttribute("aria-pressed", "true");
  });

  it("binds form labels", () => {
    render(
      <div>
        <Field label="管理员" num="01" />
        <TextArea label="原始订阅" num="02" />
        <Select label="目标" num="03"><option>clash-meta</option></Select>
        <Checkbox label="记住" />
      </div>,
    );
    expect(screen.getByLabelText("管理员")).toBeInTheDocument();
    expect(screen.getByLabelText("原始订阅")).toBeInTheDocument();
    expect(screen.getByLabelText("目标")).toBeInTheDocument();
    expect(screen.getByLabelText("记住")).toBeInTheDocument();
  });

  it("renders tabs, icon button, spark, heatmap and status", () => {
    render(
      <div>
        <Tabs><Tab pressed>概览</Tab></Tabs>
        <IconBtn label="通知"><svg /></IconBtn>
        <Spark values={[1, 4, 2]} />
        <Heatmap cells={[{ date: "2026-07-01", value: 5 }]} />
        <StatusDot tone="ok" label="运行中" />
      </div>,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "概览" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "sparkline" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "activity heatmap" })).toBeInTheDocument();
    expect(screen.getByText("运行中")).toBeInTheDocument();
  });

  it("renders ledgers and modal", async () => {
    const onClose = vi.fn();
    render(
      <div>
        <Ledger columns={[{ key: "name", label: "NAME", render: (row: { name: string }) => row.name }]} rows={[{ name: "ax_123" }]} getRowKey={(row) => row.name} />
        <Modal open title="新建凭证" onClose={onClose}><p>正文</p></Modal>
      </div>,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "新建凭证" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("copies mono code values", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<MonoCode value="/v1/sub?token=ax_123456" />);
    await userEvent.click(screen.getByRole("button", { name: "复制" }));
    expect(writeText).toHaveBeenCalledWith("/v1/sub?token=ax_123456");
    expect(screen.getByRole("button", { name: "已复制" })).toBeInTheDocument();
  });
});
