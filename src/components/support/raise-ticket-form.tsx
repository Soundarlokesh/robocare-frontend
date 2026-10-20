"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ImagePlus, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-fields";
import { ApiError, getJson, postForm, postJson } from "@/lib/api";
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, PHOTO_SLOTS } from "@/lib/booking";
import { BOOKING_REFERENCE_RE, normalizeMobileForDisplay, SERVICE_REFERENCE_RE } from "@/lib/support";

type Category = { value: string; label: string };
type Created = { id: string; reference: string; status: string; message: string };

const schema = z
  .object({
    customer_name: z.string().trim().min(2, "Enter your name").max(120, "Name must be 120 characters or fewer"),
    mobile: z
      .string()
      .trim()
      .refine((value) => normalizeMobileForDisplay(value) !== null, "Enter a valid 10-digit mobile number"),
    email: z.string().trim().refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
    appliance_type: z.enum(["robot_vacuum", "dishwasher"], { error: "Choose an appliance" }),
    brand: z.string().trim().max(60, "Brand must be 60 characters or fewer"),
    model_number: z.string().trim().max(60, "Model must be 60 characters or fewer"),
    issue_category: z.string().min(1, "Choose the kind of issue"),
    description: z
      .string()
      .trim()
      .min(10, "Describe the problem in at least 10 characters")
      .max(2000, "Description must be 2000 characters or fewer"),
    pincode: z.string().trim().refine((value) => value === "" || /^[1-9]\d{5}$/.test(value), "Enter a valid 6-digit pincode"),
    booking_reference: z
      .string()
      .trim()
      .refine((value) => value === "" || BOOKING_REFERENCE_RE.test(value), "Use the format RC-2026-0001"),
    service_reference: z
      .string()
      .trim()
      .refine((value) => value === "" || SERVICE_REFERENCE_RE.test(value), "Use the format TK-2026-0001"),
    preferred_contact: z.enum(["phone", "whatsapp"], { error: "Choose how we should contact you" }),
    appliance_photo: z.custom<FileList | undefined>(),
    model_photo: z.custom<FileList | undefined>(),
    error_code_photo: z.custom<FileList | undefined>(),
  })
  .superRefine((values, ctx) => {
    for (const slot of PHOTO_SLOTS) {
      const file = values[slot.key]?.item(0);
      if (!file) continue;
      if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
        ctx.addIssue({ code: "custom", path: [slot.key], message: "Upload a JPEG, PNG or WebP photo" });
      } else if (file.size > MAX_PHOTO_BYTES) {
        ctx.addIssue({ code: "custom", path: [slot.key], message: "Photos must be 10 MB or smaller" });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const DEFAULTS = {
  customer_name: "",
  mobile: "",
  email: "",
  appliance_type: "",
  brand: "",
  model_number: "",
  issue_category: "",
  description: "",
  pincode: "",
  booking_reference: "",
  service_reference: "",
  preferred_contact: "phone",
} as unknown as FormValues;

export function RaiseTicketForm() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const [phase, setPhase] = useState<"editing" | "submitting" | "done">("editing");
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; message: string; failedPhotos: string[] } | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const submitting = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS, mode: "onTouched" });

  useEffect(() => {
    let active = true;
    getJson<Category[]>("/support/categories")
      .then((data) => active && setCategories(data))
      .catch((err: unknown) => {
        if (active) setCategoryError(err instanceof ApiError ? err.message : "Issue categories could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [categoryAttempt]);

  function retryCategories() {
    setCategoryError(null);
    setCategories(null);
    setCategoryAttempt((attempt) => attempt + 1);
  }

  async function submitTicket(values: FormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("submitting");
    setServerError(null);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const created = await postJson<Created>(
        "/support/tickets",
        {
          customer_name: values.customer_name.trim(),
          mobile: values.mobile.trim(),
          email: values.email.trim() || undefined,
          appliance_type: values.appliance_type,
          brand: values.brand.trim() || undefined,
          model_number: values.model_number.trim() || undefined,
          issue_category: values.issue_category,
          description: values.description.trim(),
          pincode: values.pincode.trim() || undefined,
          booking_reference: values.booking_reference.trim() || undefined,
          service_reference: values.service_reference.trim() || undefined,
          preferred_contact: values.preferred_contact,
        },
        { "Idempotency-Key": idempotencyKey.current },
      );

      const failedPhotos: string[] = [];
      for (const slot of PHOTO_SLOTS) {
        const file = values[slot.key]?.item(0);
        if (!file) continue;
        const form = new FormData();
        form.append("kind", slot.kind);
        form.append("file", file);
        try {
          await postForm(`/support/tickets/${created.id}/uploads`, form);
        } catch {
          failedPhotos.push(slot.label);
        }
      }
      setResult({ reference: created.reference, message: created.message, failedPhotos });
      setPhase("done");
    } catch (error) {
      setPhase("editing");
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        let mapped = false;
        for (const detail of error.details) {
          if (detail.field in DEFAULTS) {
            setError(detail.field as keyof FormValues, { type: "server", message: detail.message });
            mapped = true;
          }
        }
        if (!mapped) setServerError(error.message);
      } else {
        setServerError(error instanceof ApiError ? error.message : "Something unexpected happened. Please try again.");
      }
    } finally {
      submitting.current = false;
    }
  }

  if (phase === "done" && result) {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-success/30 bg-success-soft p-6 sm:p-8">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold text-ink">Support request received</h2>
        <p className="mt-2 text-ink-muted">{result.message}</p>
        <p className="mt-6 text-sm text-ink-muted">Your support reference</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-wide text-ink">{result.reference}</p>
        <p className="mt-3 text-sm text-ink-muted">
          Save this reference. Use it on the{" "}
          <a href="/support/check-ticket" className="font-medium text-brand underline-offset-4 hover:underline">
            Check a Ticket
          </a>{" "}
          page to see responses from our support team.
        </p>
        {result.failedPhotos.length > 0 ? (
          <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-ink">
            Your request was saved, but these photos could not be uploaded: {result.failedPhotos.join(", ")}.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              idempotencyKey.current = null;
              reset(DEFAULTS);
              setResult(null);
              setPhase("editing");
            }}
          >
            Raise another request
          </Button>
        </div>
      </div>
    );
  }

  const busy = phase === "submitting";
  return (
    <form onSubmit={(event) => void handleSubmit(submitTicket)(event)} noValidate className="space-y-10" aria-busy={busy}>
      {serverError ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">About you</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Your name" required error={errors.customer_name?.message}>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} autoComplete="name" invalid={invalid} describedBy={describedBy} {...register("customer_name")} />
            )}
          </Field>
          <Field label="Mobile number" required error={errors.mobile?.message} hint="The number our support team uses to contact you">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} type="tel" inputMode="tel" autoComplete="tel-national" invalid={invalid} describedBy={describedBy} {...register("mobile")} />
            )}
          </Field>
          <Field label="Email" error={errors.email?.message} hint="Optional">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} type="email" autoComplete="email" invalid={invalid} describedBy={describedBy} {...register("email")} />
            )}
          </Field>
          <Field label="How should we contact you?" required error={errors.preferred_contact?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("preferred_contact")}>
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
              </SelectInput>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">The appliance and the issue</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Appliance" required error={errors.appliance_type?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("appliance_type")}>
                <option value="">Choose one</option>
                <option value="robot_vacuum">Robot vacuum cleaner</option>
                <option value="dishwasher">Dishwasher</option>
              </SelectInput>
            )}
          </Field>
          <Field label="Kind of issue" required error={errors.issue_category?.message ?? categoryError ?? undefined}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} disabled={!categories} {...register("issue_category")}>
                <option value="">{categories ? "Choose one" : "Loading…"}</option>
                {(categories ?? []).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          {categoryError ? (
            <button
              type="button"
              onClick={retryCategories}
              className="-mt-3 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Try loading the issue list again
            </button>
          ) : null}
          <Field label="Brand" error={errors.brand?.message}>
            {({ id, describedBy, invalid }) => <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("brand")} />}
          </Field>
          <Field label="Model number" error={errors.model_number?.message}>
            {({ id, describedBy, invalid }) => <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("model_number")} />}
          </Field>
          <Field label="Describe the problem" required error={errors.description?.message} className="md:col-span-2">
            {({ id, describedBy, invalid }) => (
              <TextArea id={id} rows={5} invalid={invalid} describedBy={describedBy} {...register("description")} />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Existing references (optional)</legend>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Booking reference" error={errors.booking_reference?.message} hint="e.g. RC-2026-0001">
            {({ id, describedBy, invalid }) => <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("booking_reference")} />}
          </Field>
          <Field label="Service ticket reference" error={errors.service_reference?.message} hint="e.g. TK-2026-0001">
            {({ id, describedBy, invalid }) => <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("service_reference")} />}
          </Field>
          <Field label="Pincode" error={errors.pincode?.message}>
            {({ id, describedBy, invalid }) => <TextInput id={id} inputMode="numeric" maxLength={6} invalid={invalid} describedBy={describedBy} {...register("pincode")} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Photos (optional)</legend>
        <p className="text-sm text-ink-muted">JPEG, PNG or WebP, up to 10 MB each.</p>
        <div className="grid gap-5 md:grid-cols-3">
          {PHOTO_SLOTS.map((slot) => (
            <Field key={slot.key} label={slot.label} error={errors[slot.key]?.message}>
              {({ id, describedBy, invalid }) => (
                <label
                  htmlFor={id}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-surface px-4 py-6 text-center text-sm text-ink-muted hover:border-brand ${
                    invalid ? "border-danger" : "border-border"
                  }`}
                >
                  <ImagePlus className="h-6 w-6 text-brand" aria-hidden="true" />
                  <span>Choose a photo</span>
                  <input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    {...register(slot.key)}
                  />
                </label>
              )}
            </Field>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">Submitting saves your request. Our support team reviews it; nothing is resolved yet.</p>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            "Submit support request"
          )}
        </Button>
      </div>
    </form>
  );
}
