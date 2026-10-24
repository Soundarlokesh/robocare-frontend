"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, ImagePlus, Loader2, RefreshCcw, Trash2, TriangleAlert } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-fields";
import { ApiError, getJson, postForm, postJson } from "@/lib/api";
import {
  APPLIANCE_OPTIONS,
  bookingSchema,
  BookingFormValues,
  maxBookingIso,
  BOOKING_PHOTO_SLOTS,
  PROBLEM_OPTIONS,
  TIME_SLOT_OPTIONS,
  todayIso,
  toBookingPayload,
  WARRANTY_OPTIONS,
} from "@/lib/booking";
import { whatsappLink, WHATSAPP_PREFILL } from "@/lib/site";

type CreatedBooking = {
  id: string;
  reference: string;
  status: string;
  message: string;
};

type Result = { reference: string; message: string; failedPhotos: string[] };

// Date limits are read in the browser; the server render has no date, so it never shows a stale window.
const noopSubscribe = () => () => {};
const serverDateKey = () => "";

const YEARS = Array.from({ length: new Date().getFullYear() - 1999 }, (_, index) => String(new Date().getFullYear() - index));

// Empty strings for unanswered selects: the schema rejects them with a clear "choose" message.
const DEFAULTS = {
  full_name: "",
  customer_type: "",
  mobile: "",
  whatsapp_number: "",
  email: "",
  address: "",
  pincode: "",
  appliance_type: "",
  brand: "",
  model_number: "",
  purchase_year: "",
  warranty_status: "unknown",
  problem_category: "",
  problem_description: "",
  error_code: "",
  preferred_date: "",
  preferred_time_slot: "",
} as unknown as BookingFormValues;

type ServiceCheck = { state: "idle" | "checking" | "ok" | "unavailable" | "error"; message?: string };

// Thumbnail of a chosen photo. The object URL is released when the photo changes or the form unmounts.
function PhotoThumb({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-40 w-full rounded-xl object-cover" />;
}

// One photo slot: gallery or files, a camera button on phones, a preview, and replace or remove.
function PhotoSlotPicker({
  label,
  file,
  error,
  onChange,
}: {
  label: string;
  file: File | undefined;
  error?: string;
  onChange: (files: FileList | undefined) => void;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    const transfer = new DataTransfer();
    transfer.items.add(chosen);
    onChange(transfer.files);
  }

  const inputClass = "sr-only";
  const accept = "image/jpeg,image/png,image/webp";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-3">
        {file ? (
          <div className="space-y-3">
            <PhotoThumb file={file} />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink-muted">{Math.max(1, Math.round(file.size / 1024))} KB</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-ink hover:bg-surface-muted"
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" /> Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-danger/30 px-3 text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-6 text-center">
            <ImagePlus className="mx-auto h-6 w-6 text-brand" aria-hidden="true" />
            <p className="text-sm text-ink-muted">JPEG, PNG or WebP, up to 10 MB</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-muted"
              >
                <ImagePlus className="h-4 w-4 text-brand" aria-hidden="true" /> Choose from device
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-strong"
              >
                <Camera className="h-4 w-4" aria-hidden="true" /> Take photo
              </button>
            </div>
          </div>
        )}
      </div>
      <input ref={galleryRef} type="file" accept={accept} className={inputClass} onChange={pick} aria-label={`${label}: choose from device`} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className={inputClass} onChange={pick} aria-label={`${label}: take photo`} />
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingForm() {
  const [phase, setPhase] = useState<"editing" | "submitting" | "done">("editing");
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [serviceCheck, setServiceCheck] = useState<ServiceCheck>({ state: "idle" });
  // One key per form instance: retries of the same submission reuse it, so the backend cannot create duplicates.
  // Created on first submit (never during prerender). Reset when the customer starts a new booking.
  const idempotencyKey = useRef<string | null>(null);
  const submitting = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  const appliance = useWatch({ control, name: "appliance_type" });
  const chosenPhotos = useWatch({ control, name: BOOKING_PHOTO_SLOTS.map((slot) => slot.key) });
  // Booking window limits are set in the browser after load, so they are always current (never frozen at build time).
  const todayKey = useSyncExternalStore(noopSubscribe, todayIso, serverDateKey);
  // Brand suggestions come from the brands the admin has added to each product. Customers can still type any brand.
  const [catalogueBrands, setCatalogueBrands] = useState<Record<string, string[]>>({});
  useEffect(() => {
    let active = true;
    getJson<{ name: string; brands: { name: string }[] }[]>("/catalogue/services")
      .then((services) => {
        if (!active) return;
        setCatalogueBrands(Object.fromEntries(services.map((service) => [service.name, service.brands.map((b) => b.name)])));
      })
      .catch(() => {
        if (active) setCatalogueBrands({});
      });
    return () => {
      active = false;
    };
  }, []);
  const productNameFor = (type: string) => (type === "robot_vacuum" ? "Robot vacuum cleaner" : "Dishwasher");
  const brandSuggestions: readonly string[] = appliance
    ? (catalogueBrands[productNameFor(appliance)] ?? [])
    : Array.from(new Set(Object.values(catalogueBrands).flat()));

  async function checkPincode(pincode: string) {
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setServiceCheck({ state: "idle" });
      return;
    }
    setServiceCheck({ state: "checking" });
    try {
      const data = await fetchServiceCheck(pincode);
      setServiceCheck(
        data.serviceable
          ? { state: "ok", message: data.message }
          : { state: "unavailable", message: data.message },
      );
    } catch (error) {
      setServiceCheck({
        state: "error",
        message: error instanceof ApiError ? error.message : "We could not check this pincode right now.",
      });
    }
  }

  async function submitBooking(values: BookingFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("submitting");
    setServerError(null);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const created = await postJson<CreatedBooking>("/bookings", toBookingPayload(values), {
        "Idempotency-Key": idempotencyKey.current,
      });

      const failedPhotos: string[] = [];
      for (const slot of BOOKING_PHOTO_SLOTS) {
        const file = values[slot.key]?.item(0);
        if (!file) continue;
        const form = new FormData();
        form.append("kind", slot.kind);
        form.append("file", file);
        try {
          await postForm(`/bookings/${created.id}/uploads`, form);
        } catch {
          failedPhotos.push(slot.label);
        }
      }
      setResult({ reference: created.reference, message: created.message, failedPhotos });
      setPhase("done");
    } catch (error) {
      setPhase("editing");
      if (!(error instanceof ApiError)) {
        setServerError("Something unexpected happened. Please try again.");
      } else if (error.code === "SERVICE_AREA_UNAVAILABLE") {
        // The pincode field and the availability panel explain this; no banner needed.
        setServiceCheck({ state: "unavailable", message: error.message });
        setError("pincode", { type: "server", message: error.message });
      } else if (error.code === "VALIDATION_ERROR") {
        let mapped = false;
        for (const detail of error.details) {
          if (detail.field in DEFAULTS) {
            setError(detail.field as keyof BookingFormValues, { type: "server", message: detail.message });
            mapped = true;
          }
        }
        if (!mapped) setServerError(error.message);
      } else {
        setServerError(error.message);
      }
    } finally {
      submitting.current = false;
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submitBooking)(event);
  };

  if (phase === "done" && result) {
    return (
      <div role="status" aria-live="polite" className="rounded-2xl border border-success/30 bg-success-soft p-6 sm:p-8">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold text-ink">Booking request received</h2>
        <p className="mt-2 text-ink-muted">{result.message}</p>
        <p className="mt-6 text-sm text-ink-muted">Your booking reference</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-wide text-ink">{result.reference}</p>
        <p className="mt-3 text-sm text-ink-muted">
          This is a request, not a confirmed appointment. Keep this reference when you contact us.
        </p>
        {result.failedPhotos.length > 0 ? (
          <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-ink">
            Your request was saved, but these photos could not be uploaded: {result.failedPhotos.join(", ")}. You can send
            them on WhatsApp with your reference.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
          <ButtonLink href="/book/check-booking" variant="secondary">
            Check booking status
          </ButtonLink>
          <Button
            variant="ghost"
            onClick={() => {
              idempotencyKey.current = null;
              reset(DEFAULTS);
              setResult(null);
              setServiceCheck({ state: "idle" });
              setPhase("editing");
            }}
          >
            Book another service
          </Button>
        </div>
      </div>
    );
  }

  const busy = phase === "submitting";
  const waLink = whatsappLink(WHATSAPP_PREFILL);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10" aria-busy={busy}>
      {serverError ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Your details</legend>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink">
            Customer type <span className="text-danger" aria-hidden="true">*</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "new", title: "New Customer", text: "First time booking with RoboCare" },
              { value: "existing", title: "Existing Customer", text: "Booked with RoboCare before" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand-soft/50"
              >
                <input type="radio" value={option.value} className="mt-1 h-4 w-4 accent-[var(--brand)]" {...register("customer_type")} />
                <span>
                  <span className="block font-semibold text-ink">{option.title}</span>
                  <span className="block text-sm text-ink-muted">{option.text}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.customer_type?.message ? (
            <p role="alert" className="text-sm text-danger">{errors.customer_type.message}</p>
          ) : null}
        </fieldset>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full name" required error={errors.full_name?.message}>
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} autoComplete="name" invalid={invalid} describedBy={describedBy} {...register("full_name")} />
            )}
          </Field>
          <Field label="Mobile number" required error={errors.mobile?.message} hint="10-digit Indian mobile number">
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                invalid={invalid}
                describedBy={describedBy}
                {...register("mobile")}
              />
            )}
          </Field>
          <Field label="WhatsApp number" error={errors.whatsapp_number?.message} hint="Leave blank if same as mobile">
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="tel"
                inputMode="tel"
                invalid={invalid}
                describedBy={describedBy}
                {...register("whatsapp_number")}
              />
            )}
          </Field>
          <Field label="Email" error={errors.email?.message} hint="Optional">
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="email"
                autoComplete="email"
                invalid={invalid}
                describedBy={describedBy}
                {...register("email")}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Service address</legend>
        <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
          <Field label="Address" required error={errors.address?.message} className="md:col-span-2">
            {({ id, describedBy, invalid }) => (
              <TextArea
                id={id}
                rows={3}
                autoComplete="street-address"
                invalid={invalid}
                describedBy={describedBy}
                {...register("address")}
              />
            )}
          </Field>
          <Field
            label="Pincode"
            required
            error={errors.pincode?.message ?? (serviceCheck.state === "unavailable" ? serviceCheck.message : undefined)}
            hint={serviceCheck.state === "ok" ? serviceCheck.message : undefined}
          >
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                invalid={invalid || serviceCheck.state === "unavailable"}
                describedBy={describedBy}
                {...register("pincode", {
                  onBlur: (event) => checkPincode(event.target.value.trim()),
                })}
              />
            )}
          </Field>
          <div className="flex items-end" aria-live="polite">
            {serviceCheck.state === "checking" ? <p className="text-sm text-ink-muted">Checking your area…</p> : null}
            {serviceCheck.state === "error" ? <p className="text-sm text-danger">{serviceCheck.message}</p> : null}
            {serviceCheck.state === "ok" ? (
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Home service available
              </p>
            ) : null}
          </div>
        </div>
        {serviceCheck.state === "unavailable" ? (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-ink">
            <p>{serviceCheck.message}</p>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-brand underline-offset-4 hover:underline">
                Check availability on WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Appliance</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Appliance type" required error={errors.appliance_type?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("appliance_type")}>
                <option value="" disabled>
                  Choose one
                </option>
                {APPLIANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label="Brand" required error={errors.brand?.message} hint="Choose a suggestion or type your brand">
            {({ id, describedBy, invalid }) => (
              <>
                <TextInput
                  id={id}
                  list={`${id}-brands`}
                  invalid={invalid}
                  describedBy={describedBy}
                  {...register("brand")}
                />
                <datalist id={`${id}-brands`}>
                  {brandSuggestions.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                  <option value="Other" />
                </datalist>
              </>
            )}
          </Field>
          <Field label="Model number" error={errors.model_number?.message} hint="Found on the label. Helps us prepare.">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("model_number")} />
            )}
          </Field>
          <Field label="Purchase year" error={errors.purchase_year?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("purchase_year")}>
                <option value="">Not sure</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label="Warranty status" error={errors.warranty_status?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("warranty_status")}>
                {WARRANTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">The problem</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="What is the problem?" required error={errors.problem_category?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("problem_category")}>
                <option value="" disabled>
                  Choose one
                </option>
                {PROBLEM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label="Error code" error={errors.error_code?.message} hint="If the appliance shows one">
            {({ id, describedBy, invalid }) => (
              <TextInput id={id} invalid={invalid} describedBy={describedBy} {...register("error_code")} />
            )}
          </Field>
          <Field label="Describe the problem" error={errors.problem_description?.message} className="md:col-span-2" hint="Optional. What happens, and when?">
            {({ id, describedBy, invalid }) => (
              <TextArea
                id={id}
                rows={4}
                invalid={invalid}
                describedBy={describedBy}
                {...register("problem_description")}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Photos (optional)</legend>
        <p className="text-sm text-ink-muted">JPEG, PNG or WebP, up to 10 MB each.</p>
        <div className="grid gap-5 md:grid-cols-2">
          {BOOKING_PHOTO_SLOTS.map((slot) => (
            <PhotoSlotPicker
              key={slot.key}
              label={slot.label}
              file={chosenPhotos[BOOKING_PHOTO_SLOTS.findIndex((item) => item.key === slot.key)]?.item(0) ?? undefined}
              error={errors[slot.key]?.message}
              onChange={(files) => setValue(slot.key, files, { shouldValidate: true })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-ink">Preferred appointment</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Preferred date" required error={errors.preferred_date?.message} hint="Requests are confirmed by our team">
            {({ id, describedBy, invalid }) => (
              <TextInput
                id={id}
                type="date"
                min={todayKey || undefined}
                max={todayKey ? maxBookingIso() : undefined}
                invalid={invalid}
                describedBy={describedBy}
                {...register("preferred_date")}
              />
            )}
          </Field>
          <Field label="Preferred time slot" required error={errors.preferred_time_slot?.message}>
            {({ id, describedBy, invalid }) => (
              <SelectInput id={id} invalid={invalid} describedBy={describedBy} {...register("preferred_time_slot")}>
                <option value="" disabled>
                  Choose a slot
                </option>
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">Submitting sends a service request. It does not confirm an appointment.</p>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending request…
            </>
          ) : (
            "Book Home Service"
          )}
        </Button>
      </div>
    </form>
  );
}

function fetchServiceCheck(pincode: string) {
  return getJson<{ serviceable: boolean; message: string }>(`/service-areas/check/${pincode}`);
}
