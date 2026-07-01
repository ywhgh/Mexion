import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { FadeIn, PageHead } from "../components/page";
import { Button, Card, Field, Pill, Select } from "../components/ui";
import { apiFetch, jsonBody } from "../lib/api";
import { useLang } from "../lib/i18n";
import { useUiStore } from "../store/ui";
import type { SettingsPublic } from "../lib/types";

export function Settings() {
  const queryClient = useQueryClient();
  const { setLang } = useLang();
  const setStoreLang = useUiStore((state) => state.setLang);
  const setTheme = useUiStore((state) => state.setTheme);
  const [instanceName, setInstanceName] = useState("Axion");
  const [themeValue, setThemeValue] = useState<"light" | "dark">("light");
  const [langValue, setLangValue] = useState<"zh" | "en">("zh");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => apiFetch<{ settings: SettingsPublic }>("/api/settings"),
  });

  useEffect(() => {
    const settings = settingsQuery.data?.settings;
    if (!settings) return;
    setInstanceName(settings.instanceName);
    setThemeValue(settings.theme);
    setLangValue(settings.lang);
  }, [settingsQuery.data?.settings]);

  const patchMutation = useMutation({
    mutationFn: async () => apiFetch<{ settings: SettingsPublic }>("/api/settings", {
      method: "PATCH",
      body: jsonBody({ instanceName, theme: themeValue, lang: langValue }),
    }),
    onSuccess: (data) => {
      setTheme(data.settings.theme);
      setLang(data.settings.lang);
      setStoreLang(data.settings.lang);
      setMessage("设置已保存");
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async () => apiFetch<{ changed: true }>("/api/auth/password", {
      method: "PATCH",
      body: jsonBody({ currentPassword, nextPassword }),
    }),
    onSuccess: () => {
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setMessage("密钥已更新");
    },
  });

  function saveSettings(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    patchMutation.mutate();
  }

  function changePassword(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    if (nextPassword !== confirmPassword) {
      setMessage("两次新密钥不一致");
      return;
    }
    passwordMutation.mutate();
  }

  return (
    <>
      <PageHead
        crumb={[<span key="root">Overview</span>, <span key="settings">Settings</span>]}
        title={<>系统 <em>设置</em></>}
        sub="主题、语言、实例名称与单管理员密钥。"
        actions={message ? <Pill tone={message.includes("不一致") ? "warn" : "ok"}>{message}</Pill> : undefined}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <FadeIn step={2}>
          <Card title="Instance" eyebrow="runtime preferences">
            <form className="grid gap-5" onSubmit={saveSettings}>
              <Field label="实例名称" num="01" value={instanceName} onChange={(event) => setInstanceName(event.target.value)} required />
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="主题" num="02" value={themeValue} onChange={(event) => setThemeValue(event.target.value as "light" | "dark")}>
                  <option value="light">light</option>
                  <option value="dark">dark</option>
                </Select>
                <Select label="语言" num="03" value={langValue} onChange={(event) => setLangValue(event.target.value as "zh" | "en")}>
                  <option value="zh">zh</option>
                  <option value="en">en</option>
                </Select>
              </div>
              <div className="flex justify-end"><Button type="submit" variant="primary" loading={patchMutation.isPending}>保存设置</Button></div>
            </form>
          </Card>
        </FadeIn>
        <FadeIn step={3}>
          <Card title="Password" eyebrow="single admin">
            <form className="grid gap-5" onSubmit={changePassword}>
              <Field label="当前密钥" num="01" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
              <Field label="新密钥" num="02" type="password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} minLength={8} required />
              <Field label="确认新密钥" num="03" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required />
              <div className="flex justify-end"><Button type="submit" variant="danger" loading={passwordMutation.isPending}>更新密钥</Button></div>
            </form>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
