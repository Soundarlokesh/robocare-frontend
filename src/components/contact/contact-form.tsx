"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-fields";
import { ApiError, postJson } from "@/lib/api";

const SERVICE_CHOICES = [
  { value: "robot_vacuum", label: "Robot vacuum service or repair" },
  { value: "dishwasher", label: "Dishwasher service or repair" },
  { value: "amc", label: "Annual maintenance contract (AMC)" },
  { value: "accessories", label: "Accessories or spare parts" },
  { value: "other", label: "Something else" },
] as const;

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120, "Name must be 120 characters or fewer"),
  mobile: z
    .string()
    .trim()
    .refine((value) => /^(\+?91|0)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number"),
  email: z.string().trim().refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
  service_required: z.string().refine((value) => SERVICE_CHOICES.some((choice) => choice.value === value), {
    error: "Choose what you need",
  }),
  message: z.string().trim().max(1000, "Message must be 1000 characters or fewer"),
});

type ContactValues = z.infer<typeof schema>;

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const submitting = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { full_name: "", mobile: "", email: "", service_required: "", message: "" },
  });

  async function submitEnquiry(values: ContactValues) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setServerError(null);
    try {
      const data = await postJson<{ reference: string }>("/leads/contact", {
        full_name: values.full_name,
        mobile: values.mobile,
        email: values.email || undefined,
        service_required: values.service_required,
        message: values.message || undefined,
      });
      setReference(data.reference);
      reset();
    } catch (error) {
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        let mapped = false;
        for (const detail of error.details) {
          if (detail.field in schema.shape) {
            setError(detail.field as keyof ContactValues, { type: "server", message: detail.message });
            mapped = true;
          }
        }
        if (!mapped) setServerError(error.message);
      } else {
        setServerError(error instanceof ApiError ? error.message : "Something unexpected happened. Please try again.");
      }
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submitEnquiry)(event);
  };

  if (reference) {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-success/30 bg-success-soft p-6">
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        <p className="mt-3 text-lg font-semibold text-ink">Thanks, we&apos;ve received your enquiry.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Your reference: <span className="font-mono font-semibold text-ink">{reference}</span>
        </p>
        <Button variant="ghost" className="mt-4 px-0" onClick={() => setReference(null)}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={busy}>
      {serverError ? (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {serverError}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" required error={errors.full_name?.message}>
          {({ id, describedBy, invalid }) => (
            <TextInput id={id} autoComplete="name" invalid={invalid} describedBy={describedBy} {...register("full_name")} />
          )}
        </Field>
        <Field label="Mobile" required error={errors.mobile?.message}>
          {({ id, describedBy, invalid }) => (
            <TextInput id={id} type="tel" autoComplete="tel-national" invalid={invalid} describedBy={describedBy} {...register("mobile")} />
          )}
        </Field>
        <Field label="Email" error={errors.email?.message} hint="Optional">
          {({ id, describedBy, invalid }) => (
            <TextInput id={id} type="email" autoComplete="email" invalid={invalid} describedBy={describedBy} {...register("email")} />
          )}
        </Field>
        <Field label="Service required" required error={errors.service_required?.message}>
          {({ id, describedBy, invalid }) => (
            <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("service_required")}>
              <option value="">Choose one</option>
              {SERVICE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message} hint="Optional">
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} rows={5} invalid={invalid} describedBy={describedBy} {...register("message")} />
        )}
      </Field>
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          "Submit Enquiry"
        )}
      </Button>
    </form>
  );
}
