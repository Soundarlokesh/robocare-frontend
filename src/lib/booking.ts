import { z } from "zod";

// Options mirror the backend enums (app/models/enums.py). Keep the values in sync.
export const APPLIANCE_OPTIONS = [
  { value: "robot_vacuum", label: "Robot vacuum cleaner" },
  { value: "dishwasher", label: "Dishwasher" },
] as const;

export const WARRANTY_OPTIONS = [
  { value: "in_warranty", label: "Under warranty" },
  { value: "out_of_warranty", label: "Out of warranty" },
  { value: "unknown", label: "Not sure" },
] as const;

export const PROBLEM_OPTIONS = [
  { value: "not_switching_on", label: "Not switching on" },
  { value: "not_charging", label: "Not charging" },
  { value: "not_cleaning", label: "Not cleaning" },
  { value: "navigation", label: "Navigation problem" },
  { value: "water_leakage", label: "Water leakage" },
  { value: "drain_problem", label: "Drain problem" },
  { value: "noise", label: "Noise" },
  { value: "error_code", label: "Error code shown" },
  { value: "battery_issue", label: "Battery issue" },
  { value: "other", label: "Other" },
] as const;

export const TIME_SLOT_OPTIONS = [
  { value: "09:00-12:00", label: "9 AM – 12 PM" },
  { value: "12:00-15:00", label: "12 PM – 3 PM" },
  { value: "15:00-18:00", label: "3 PM – 6 PM" },
  { value: "18:00-20:00", label: "6 PM – 8 PM" },
] as const;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const PHOTO_SLOTS = [
  { key: "appliance_photo", kind: "appliance_photo", label: "Appliance photo" },
  { key: "model_photo", kind: "model_photo", label: "Model number label photo" },
  { key: "error_code_photo", kind: "error_code_photo", label: "Error code photo" },
] as const;

export const ADVANCE_DAYS = 60;

function localIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return localIsoDate(new Date());
}

export function maxBookingIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + ADVANCE_DAYS);
  return localIsoDate(date);
}

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

const MOBILE_RE = /^(\+?91|0)?[6-9]\d{9}$/;

export const bookingSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(120, "Name must be 120 characters or fewer"),
    mobile: z
      .string()
      .trim()
      .refine((value) => MOBILE_RE.test(value.replace(/[\s-]/g, "")), "Enter a valid 10-digit mobile number"),
    whatsapp_number: z
      .string()
      .trim()
      .refine((value) => value === "" || MOBILE_RE.test(value.replace(/[\s-]/g, "")), "Enter a valid WhatsApp number"),
    email: z.string().trim().refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
    address: z
      .string()
      .trim()
      .min(10, "Add your full address so the team can find you")
      .max(300, "Address must be 300 characters or fewer"),
    pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
    appliance_type: z.enum(["robot_vacuum", "dishwasher"], { error: "Choose an appliance type" }),
    brand: z.string().trim().min(1, "Enter the brand").max(60, "Brand must be 60 characters or fewer"),
    model_number: optionalText(60, "Model number"),
    purchase_year: z.string(),
    warranty_status: z.enum(["in_warranty", "out_of_warranty", "unknown"], { error: "Choose a warranty status" }),
    problem_category: z.enum(
      [
        "not_switching_on",
        "not_charging",
        "not_cleaning",
        "navigation",
        "water_leakage",
        "drain_problem",
        "noise",
        "error_code",
        "battery_issue",
        "other",
      ],
      { error: "Choose the problem you are facing" },
    ),
    problem_description: optionalText(1000, "Description"),
    error_code: optionalText(30, "Error code"),
    preferred_date: z.string().min(1, "Choose a preferred date"),
    preferred_time_slot: z.enum(["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-20:00"], {
      error: "Choose a time slot",
    }),
    appliance_photo: z.custom<FileList | undefined>(),
    model_photo: z.custom<FileList | undefined>(),
    error_code_photo: z.custom<FileList | undefined>(),
  })
  .superRefine((values, ctx) => {
    if (values.preferred_date && values.preferred_date < todayIso()) {
      ctx.addIssue({ code: "custom", path: ["preferred_date"], message: "Choose today or a later date" });
    }
    if (values.preferred_date && values.preferred_date > maxBookingIso()) {
      ctx.addIssue({
        code: "custom",
        path: ["preferred_date"],
        message: `Choose a date within ${ADVANCE_DAYS} days`,
      });
    }
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

export type BookingFormValues = z.infer<typeof bookingSchema>;

export type BookingPayload = {
  full_name: string;
  mobile: string;
  whatsapp_number?: string;
  email?: string;
  address: string;
  pincode: string;
  appliance_type: "robot_vacuum" | "dishwasher";
  brand: string;
  model_number?: string;
  purchase_year?: number;
  warranty_status: "in_warranty" | "out_of_warranty" | "unknown";
  problem_category: string;
  problem_description?: string;
  error_code?: string;
  preferred_date: string;
  preferred_time_slot: string;
};

export function toBookingPayload(values: BookingFormValues): BookingPayload {
  const clean = (value: string) => (value.trim() === "" ? undefined : value.trim());
  return {
    full_name: values.full_name.trim(),
    mobile: values.mobile.trim(),
    whatsapp_number: clean(values.whatsapp_number),
    email: clean(values.email),
    address: values.address.trim(),
    pincode: values.pincode.trim(),
    appliance_type: values.appliance_type,
    brand: values.brand.trim(),
    model_number: clean(values.model_number),
    purchase_year: values.purchase_year ? Number(values.purchase_year) : undefined,
    warranty_status: values.warranty_status,
    problem_category: values.problem_category,
    problem_description: clean(values.problem_description),
    error_code: clean(values.error_code),
    preferred_date: values.preferred_date,
    preferred_time_slot: values.preferred_time_slot,
  };
}
