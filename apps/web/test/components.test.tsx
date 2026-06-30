/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  DataRow,
  Header,
  Modal,
  MonoCode,
  PaperFrame,
  Select,
  StatusDot,
  TableLedger,
  TextArea,
  TextField,
} from "../src/components";
import { Demo } from "../src/pages/Demo";

describe("design primitives", () => {
  it("renders a button with editorial copy", () => {
    render(<Button variant="cinnabar">复制凭证</Button>);
    expect(screen.getByRole("button", { name: "复制凭证" })).toBeInTheDocument();
  });

  it("binds text field labels", () => {
    render(<TextField label="管理员" />);
    expect(screen.getByLabelText("管理员")).toBeInTheDocument();
  });

  it("renders the paper frame and navigation", () => {
    render(
      <MemoryRouter>
        <PaperFrame>
          <p>案卷正文</p>
        </PaperFrame>
      </MemoryRouter>,
    );
    expect(screen.getByText("AXION · VOL. I · EST. 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "§ 订阅" })).toHaveAttribute("href", "/subs");
  });

  it("renders header status alone", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("核心中转：正常运行")).toBeInTheDocument();
  });

  it("renders field variants and ledger rows", () => {
    render(
      <div>
        <TextArea label="原始订阅" />
        <Select label="目标客户端">
          <option>Clash Meta</option>
        </Select>
        <dl>
          <DataRow label="TOKEN" value="ax_12345678" />
        </dl>
        <StatusDot label="在线" variant="ok" />
      </div>,
    );
    expect(screen.getByLabelText("原始订阅")).toBeInTheDocument();
    expect(screen.getByLabelText("目标客户端")).toBeInTheDocument();
    expect(screen.getByText("ax_12345678")).toBeInTheDocument();
    expect(screen.getByText("在线")).toBeInTheDocument();
  });

  it("renders table ledgers with and without rows", () => {
    const columns = [
      { key: "name", label: "NAME", render: (row: { name: string }) => row.name },
    ];
    const { rerender } = render(
      <TableLedger columns={columns} empty="未见墨迹" getRowKey={(row) => row.name} rows={[]} />,
    );
    expect(screen.getByText("未见墨迹")).toBeInTheDocument();
    rerender(<TableLedger columns={columns} getRowKey={(row) => row.name} rows={[{ name: "demo" }]} />);
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("renders modal content and close control", async () => {
    const onClose = vi.fn();
    render(
      <Modal footer={<Button>存档</Button>} onClose={onClose} open title="新建凭证">
        <p>凭证正文</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText("凭证正文")).toBeInTheDocument();
  });

  it("returns null for a closed modal", () => {
    render(
      <Modal onClose={() => undefined} open={false} title="隐藏">
        <p>不可见</p>
      </Modal>,
    );
    expect(screen.queryByText("不可见")).not.toBeInTheDocument();
  });

  it("copies mono code values", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<MonoCode value="https://example.local/v1/sub?token=ax_12345678" />);
    await userEvent.click(screen.getByRole("button", { name: "复制凭证" }));
    expect(writeText).toHaveBeenCalledWith("https://example.local/v1/sub?token=ax_12345678");
    expect(screen.getByRole("button", { name: "已钤印" })).toBeInTheDocument();
  });

  it("renders the demo design baseline", () => {
    render(<Demo />);
    expect(screen.getByText("§ 一、Axion 设计样本")).toBeInTheDocument();
    expect(screen.getByText("Noto Serif SC · § 公理化终点")).toBeInTheDocument();
  });
});
