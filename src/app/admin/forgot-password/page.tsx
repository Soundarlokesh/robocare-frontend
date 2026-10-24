"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { ApiError, postJson } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 12;

const emailSchema = z.object({
  email: z.string().trim().refine((value) => z.email().safeParse(value).success, "Enter a valid email address"),
});

const resetSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from the email"),
    new_password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      .max(200, "Use at most 200 characters.")
      .refine((value) => /[A-Za-z]/.test(value), "Use at least one letter.")
      .refine((value) => /\d/.test(value), "Use at least one number."),
    confirm_password: z.string(),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ["confirm_password"],
    message: "The passwords do not match.",
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;
type ForgotResult = { message: string; development_warning: string | null };

// Step 1 asks for the staff email and emails a 6-digit code. Step 2 checks the code and sets the new password.
// The email address stays in this page's state and is never put in the URL.
export default function AdminForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<ForgotResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", new_password: "", confirm_password: "" },
    mode: "onTouched",
  });

  async function requestCode(values: EmailValues) {
    setBusy(true);
    setServerError(null);
    try {
      const data = await postJson<ForgotResult>("/admin/auth/forgot-password", { email: values.email });
      setEmail(values.email);
      setNotice(data);
      setStep("code");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "The request could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(values: ResetValues) {
    setBusy(true);
    setServerError(null);
    try {
      await postJson("/admin/auth/reset-password", { email, code: values.code, new_password: values.new_password });
      setStep("done");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "The password could not be reset. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-theme flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8 shadow-card sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Reset password</h1>

        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(requestCode)}
            noValidate
            className="mt-2 space-y-5"
            aria-busy={busy}
          >
            <p className="text-sm text-ink-muted">Enter your staff email. If it has access, we send a 6-digit code to it.</p>
            {serverError ? (
              <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
                {serverError}
              </p>
            ) : null}
            <Field label="Email" required error={emailForm.formState.errors.email?.message}>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="username"
                  invalid={invalid}
                  describedBy={describedBy}
                  {...emailForm.register("email")}
                />
              )}
            </Field>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                </>
              ) : (
                "Send code"
              )}
            </Button>
            <p className="text-center text-sm">
              <Link href="/admin/login" className="font-medium text-brand hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        ) : null}

        {step === "code" ? (
          <form
            onSubmit={resetForm.handleSubmit(resetPassword)}
            noValidate
            className="mt-2 space-y-5"
            aria-busy={busy}
          >
            {notice ? (
              <p role="status" className="flex gap-3 rounded-lg bg-success-soft p-3 text-sm text-success">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{notice.message} The code expires in 5 minutes and works once.</span>
              </p>
            ) : null}
            {notice?.development_warning ? (
              <p role="note" className="rounded-lg border border-border bg-surface-muted p-3 text-xs text-ink">
                Development only: {notice.development_warning}
              </p>
            ) : null}
            {serverError ? (
              <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
                {serverError}
              </p>
            ) : null}
            <Field label="6-digit code" required error={resetForm.formState.errors.code?.message}>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  invalid={invalid}
                  describedBy={describedBy}
                  {...resetForm.register("code")}
                />
              )}
            </Field>
            <Field label="New password" required error={resetForm.formState.errors.new_password?.message}>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  invalid={invalid}
                  describedBy={describedBy}
                  {...resetForm.register("new_password")}
                />
              )}
            </Field>
            <Field label="Confirm new password" required error={resetForm.formState.errors.confirm_password?.message}>
              {({ id, describedBy, invalid }) => (
                <TextInput
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  invalid={invalid}
                  describedBy={describedBy}
                  {...resetForm.register("confirm_password")}
                />
              )}
            </Field>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving…
                </>
              ) : (
                "Save new password"
              )}
            </Button>
            <p className="text-center text-sm">
              <button
                type="button"
                className="font-medium text-brand hover:underline"
                onClick={() => {
                  setStep("email");
                  setServerError(null);
                }}
              >
                Send a new code
              </button>
            </p>
          </form>
        ) : null}

        {step === "done" ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="flex gap-3 rounded-lg bg-success-soft p-3 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Your password has been changed. Sign in with the new password.</span>
            </p>
            <Link
              href="/admin/login"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-sm"
            >
              Go to sign in
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
