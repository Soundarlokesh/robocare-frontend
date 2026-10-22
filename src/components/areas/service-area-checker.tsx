"use client";

import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { ApiError, getJson } from "@/lib/api";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form-fields";
import { Card } from "@/components/ui/layout";
import { whatsappLink } from "@/lib/site";

type AreaRow = { city: string; area: string | null; pincode: string };
type CheckResult = { serviceable: boolean; message: string; city: string | null; contact: { whatsapp: string | null } };

export function ServiceAreaList() {
  const [areas, setAreas] = useState<AreaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<AreaRow[]>("/service-areas")
      .then((data) => active && setAreas(data))
      .catch((err: unknown) => {
        if (active) setError(err instanceof ApiError ? err.message : "Service areas could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-danger">{error}</p>
      </Card>
    );
  }
  if (areas === null) {
    return (
      <Card className="flex items-center gap-3 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading service areas…
      </Card>
    );
  }
  if (areas.length === 0) {
    return (
      <Card>
        <p className="font-semibold text-ink">Service areas are being added.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your pincode below, or contact us on WhatsApp and we&apos;ll check availability for you.
        </p>
      </Card>
    );
  }

  const byCity = areas.reduce<Record<string, AreaRow[]>>((acc, row) => {
    (acc[row.city] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(byCity).map(([city, rows]) => (
        <div key={city} className="group rounded-3xl bg-white p-7 shadow-card ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-lg font-semibold text-ink">{city}</p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {rows.map((row) => (
              <li key={`${row.city}-${row.pincode}`} className="rounded-full bg-surface-muted px-3 py-1.5 text-sm text-ink ring-1 ring-black/5">
                {row.area ? `${row.area} · ` : ""}
                <span className="font-mono">{row.pincode}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function ServiceAreaChecker() {
  const [pincode, setPincode] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function onCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = pincode.trim();
    if (!/^[1-9]\d{5}$/.test(value)) {
      setInputError("Enter a valid 6-digit pincode");
      setResult(null);
      return;
    }
    setInputError(null);
    setRequestError(null);
    setChecking(true);
    try {
      setResult(await getJson<CheckResult>(`/service-areas/check/${value}`));
    } catch (err) {
      setResult(null);
      setRequestError(err instanceof ApiError ? err.message : "We could not check this pincode right now.");
    } finally {
      setChecking(false);
    }
  }

  const waLink = result ? whatsappLink(`Hi RoboCare, is home service available at pincode ${pincode.trim()}?`) : null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
      <form onSubmit={onCheck} noValidate className="space-y-5">
        <Field label="Your pincode" required error={inputError ?? undefined}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(event) => setPincode(event.target.value)}
              invalid={invalid}
              describedBy={describedBy}
              placeholder="e.g. 600001"
            />
          )}
        </Field>
        <Button type="submit" disabled={checking}>
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
            </>
          ) : (
            "Check availability"
          )}
        </Button>
      </form>

      <div aria-live="polite" className="mt-5">
        {requestError ? <p className="text-sm text-danger">{requestError}</p> : null}
        {result?.serviceable ? (
          <div className="flex gap-3 rounded-xl bg-success-soft p-4 text-sm text-success">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{result.message}</p>
              <div className="mt-3">
                <ButtonLink href="/book" variant="secondary" className="py-2">
                  Book Home Service
                </ButtonLink>
              </div>
            </div>
          </div>
        ) : null}
        {result && !result.serviceable ? (
          <div className="flex gap-3 rounded-xl bg-danger-soft p-4 text-sm text-ink">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <p>{result.message}</p>
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-brand underline-offset-4 hover:underline">
                  Check on WhatsApp
                </a>
              ) : (
                <div className="mt-3">
                  <ButtonLink href="/contact" variant="secondary" className="py-2">
                    Contact us
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
