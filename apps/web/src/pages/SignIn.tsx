import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "@/api/client";
import { Button, PaperFrame, Section, TextField } from "@/components";
import type { Admin } from "@/store/auth";
import { useAuthStore } from "@/store/auth";

type MeResponse = {
  bootstrapped: boolean;
  admin: Admin | null;
};

type AuthForm = {
  username: string;
  password: string;
};

export function useMeQuery() {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const data = await apiFetch<MeResponse>("/api/auth/me");
      setAuth(data);
      return data;
    },
    retry: false,
  });
}

export function SignInPage(): JSX.Element {
  const me = useMeQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const bootstrapped = me.data?.bootstrapped ?? false;
  const admin = me.data?.admin ?? null;

  const submit = useMutation({
    mutationFn: async (form: AuthForm) => {
      const path = bootstrapped ? "/api/auth/sign-in" : "/api/auth/bootstrap";
      return apiFetch<{ admin: Admin }>(path, {
        method: "POST",
        body: JSON.stringify(form),
      });
    },
    onSuccess: async (data) => {
      setAuth({ admin: data.admin, bootstrapped: true });
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/");
    },
  });

  if (admin) {
    return <Navigate replace to="/" />;
  }

  return (
    <PaperFrame>
      <Section
        lead={bootstrapped ? "输入管理员凭据，重新打开本机案卷。" : "首次启动需要钤定唯一管理员。"}
        plate={bootstrapped ? "AUTH" : "INIT"}
        title={bootstrapped ? "§ 登录" : "§ 初始化管理员"}
      >
        <form
          className="mx-auto grid max-w-lg gap-5 border border-rule bg-vellum p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            submit.mutate({
              username: String(formData.get("username") ?? ""),
              password: String(formData.get("password") ?? ""),
            });
          }}
        >
          <TextField autoComplete="username" label="管理员" name="username" required />
          <TextField autoComplete="current-password" label="密钥" name="password" required type="password" />
          {submit.error ? <p className="border border-cinnabar p-3 text-sm text-cinnabar">{submit.error.message}</p> : null}
          <Button disabled={submit.isPending || me.isLoading} type="submit" variant="ink">
            {bootstrapped ? "进入案卷" : "钤定管理员"}
          </Button>
        </form>
      </Section>
    </PaperFrame>
  );
}

export function SignOutButton(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clear = useAuthStore((state) => state.clear);
  const signOut = useMutation({
    mutationFn: () => apiFetch<{ signedOut: boolean }>("/api/auth/sign-out", { method: "POST" }),
    onSuccess: async () => {
      clear();
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/sign-in");
    },
  });

  return (
    <Button disabled={signOut.isPending} onClick={() => signOut.mutate()} variant="ghost">
      登出
    </Button>
  );
}
