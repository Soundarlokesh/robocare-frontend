"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, postJson } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().refine((value) => z.email().safeParse(value).success, "Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type LoginValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-sm text-ink-muted">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" }, mode: "onTouched" });

  async function submit(values: LoginValues) {
    setBusy(true);
    setServerError(null);
    try {
      await postJson("/admin/auth/login", { email: values.email, password: values.password });
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submit)(event);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-card">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">RoboCare staff only.</p>
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5" aria-busy={busy}>
          {serverError ? (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {serverError}
            </p>
          ) : null}
          <Field label="Email" required error={errors.email?.message}>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} type="email" autoComplete="username" invalid={invalid} describedBy={describedBy} {...register("email")} />
            )}
          </Field>
          <Field label="Password" required error={errors.password?.message}>
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="password"
                autoComplete="current-password"
                invalid={invalid}
                describedBy={describedBy}
                {...register("password")}
              />
            )}
          </Field>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
