"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
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
    <div className="admin-theme grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-bold">R</span>
          <span className="font-semibold">RoboCare Admin</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Run bookings, support and service from one console.</h2>
          <p className="mt-4 leading-relaxed text-white/70">Sign in with your staff account. Access depends on your role.</p>
        </div>
        <p className="relative text-xs text-white/50">Staff access only. Activity is recorded.</p>
      </aside>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">Use your RoboCare staff email and password.</p>
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
          <div className="-mt-2 text-right">
            <Link href="/admin/forgot-password" className="text-sm font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
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
    </div>
  );
}
