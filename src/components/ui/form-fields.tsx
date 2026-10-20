import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

const control =
  "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-muted/70 " +
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Label, hint and error wrapper. Wires aria-describedby and aria-invalid for the control inside. */
export function Field({ label, error, hint, required, children, className = "" }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-0.5 text-danger" aria-hidden="true"> *</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function borderFor(invalid: boolean) {
  return invalid ? "border-danger" : "border-border";
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; describedBy?: string };

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid = false, describedBy, className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${control} ${borderFor(invalid)} ${className}`}
      {...props}
    />
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; describedBy?: string };

export const SelectInput = forwardRef<HTMLSelectElement, SelectProps>(function SelectInput(
  { invalid = false, describedBy, className = "", children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${control} ${borderFor(invalid)} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; describedBy?: string };

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { invalid = false, describedBy, className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`${control} min-h-24 ${borderFor(invalid)} ${className}`}
      {...props}
    />
  );
});
