import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/api/client";
import { Button, Section, TextField } from "@/components";
import { SignOutButton } from "./SignIn";

export function SettingsPage(): JSX.Element {
  const password = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch<{ changed: boolean }>("/api/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: String(form.get("currentPassword") ?? ""),
          nextPassword: String(form.get("nextPassword") ?? ""),
        }),
      }),
  });

  return (
    <Section lead="维护本机管理员密钥，并导出审计附录。" plate="SETTINGS" title="§ 设置">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="grid gap-4 border border-rule bg-vellum p-4"
          onSubmit={(event) => {
            event.preventDefault();
            password.mutate(new FormData(event.currentTarget));
          }}
        >
          <h2 className="font-serif text-xl font-semibold tracking-wide">§ 修改管理员密码</h2>
          <TextField label="当前密钥" name="currentPassword" required type="password" />
          <TextField label="新密钥" name="nextPassword" required type="password" />
          {password.isSuccess ? <p className="border border-rule p-3 text-sm text-mute">密钥已换新。</p> : null}
          {password.error ? <p className="border border-cinnabar p-3 text-sm text-cinnabar">{password.error.message}</p> : null}
          <Button disabled={password.isPending} type="submit" variant="ink">
            保存密钥
          </Button>
        </form>
        <div className="border border-rule bg-vellum p-4">
          <h2 className="font-serif text-xl font-semibold tracking-wide">§ 导出数据</h2>
          <p className="mt-3 text-sm leading-6 text-mute">审计日志可导出为 CSV，供离线归档或进一步检索。</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              className="inline-block border border-rule px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-200 hover:border-cinnabar hover:text-cinnabar focus:border-cinnabar focus:outline-none"
              href="/api/logs/export.csv?limit=500"
            >
              导出审计 CSV
            </a>
            <SignOutButton />
          </div>
        </div>
      </div>
    </Section>
  );
}

