"use client";

import { type FormEvent, useState } from "react";
import { useApiData } from "@/components/admin/use-api-data";
import { ErrorBanner, PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form-fields";
import { ApiError, CSRF_HEADERS, apiRequest, patchJson, postJson } from "@/lib/api";

// The two products RoboCare offers. Their brands are added here and shown on the customer Services page.
const PRODUCTS = ["Robot vacuum cleaner", "Dishwasher"] as const;

type ServiceOption = { id: string; name: string; is_active: boolean };
type ServiceDetail = {
  id: string;
  name: string;
  brands: { id: string; name: string; is_active: boolean }[];
};

function describeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.details.length > 0) {
    return err.details.map((d) => `${d.field}: ${d.message}`).join(" ");
  }
  return err instanceof ApiError ? err.message : fallback;
}

export function ProductBrandsView() {
  const services = useApiData<ServiceOption[]>("/admin/catalogue/services?page_size=100");
  const robot = services.data?.find((s) => s.name === PRODUCTS[0]);
  const dishwasher = services.data?.find((s) => s.name === PRODUCTS[1]);
  const robotDetail = useApiData<ServiceDetail>(robot ? `/admin/catalogue/services/${robot.id}` : null);
  const dishwasherDetail = useApiData<ServiceDetail>(dishwasher ? `/admin/catalogue/services/${dishwasher.id}` : null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [forRobot, setForRobot] = useState(true);
  const [forDishwasher, setForDishwasher] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function reloadAll() {
    services.reload();
    robotDetail.reload();
    dishwasherDetail.reload();
  }

  async function createMissingProducts() {
    setBusy("setup");
    setFormError(null);
    setNotice(null);
    try {
      if (!robot) await postJson("/admin/catalogue/services", { name: PRODUCTS[0], display_order: 1 });
      if (!dishwasher) await postJson("/admin/catalogue/services", { name: PRODUCTS[1], display_order: 2 });
      setNotice("Both products are set up. You can now add brands.");
      reloadAll();
    } catch (err) {
      setFormError(describeError(err, "The products could not be set up. Nothing was changed."));
    } finally {
      setBusy(null);
    }
  }

  async function addBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      setFormError("Brand name must be between 2 and 80 characters.");
      return;
    }
    if (!forRobot && !forDishwasher) {
      setFormError("Choose at least one product for this brand.");
      return;
    }
    const targets = [forRobot ? robot : null, forDishwasher ? dishwasher : null].filter(
      (service): service is ServiceOption => service !== null && service !== undefined,
    );
    if (targets.length === 0) {
      setFormError("Set up the products first, then add brands.");
      return;
    }
    setBusy("add");
    setFormError(null);
    setNotice(null);
    let brandId: string | null = null;
    try {
      const created = await postJson<{ id: string }>("/admin/catalogue/brands", {
        name: trimmed,
        description: description.trim() || null,
        is_active: true,
      });
      brandId = created.id;
      for (const service of targets) {
        await postJson(`/admin/catalogue/services/${service.id}/brands`, { brand_id: brandId });
      }
      setNotice(`"${trimmed}" was added for ${targets.map((t) => t.name).join(" and ")}. It now shows on the customer page.`);
      setName("");
      setDescription("");
      reloadAll();
    } catch (err) {
      setFormError(
        brandId
          ? `The brand was saved but could not be assigned to every product: ${describeError(err, "try again")}`
          : describeError(err, "The brand could not be saved. Nothing was changed."),
      );
      reloadAll();
    } finally {
      setBusy(null);
    }
  }

  async function toggleBrand(brand: { id: string; name: string; is_active: boolean }) {
    setBusy(`toggle-${brand.id}`);
    setFormError(null);
    setNotice(null);
    try {
      await patchJson(`/admin/catalogue/brands/${brand.id}`, { is_active: !brand.is_active });
      setNotice(brand.is_active ? `"${brand.name}" is hidden from customers.` : `"${brand.name}" is shown to customers again.`);
      reloadAll();
    } catch (err) {
      setFormError(describeError(err, "The brand could not be changed."));
    } finally {
      setBusy(null);
    }
  }

  async function removeFromProduct(service: ServiceDetail, brand: { id: string; name: string }) {
    const confirmed = window.confirm(`Remove "${brand.name}" from ${service.name}? Customers will stop seeing it under this product.`);
    if (!confirmed) return;
    setBusy(`unlink-${service.id}-${brand.id}`);
    setFormError(null);
    setNotice(null);
    try {
      await apiRequest(`/admin/catalogue/services/${service.id}/brands/${brand.id}`, {
        method: "DELETE",
        headers: { ...CSRF_HEADERS },
      });
      setNotice(`"${brand.name}" was removed from ${service.name}.`);
      reloadAll();
    } catch (err) {
      setFormError(describeError(err, "The brand could not be removed from this product."));
    } finally {
      setBusy(null);
    }
  }

  const ready = Boolean(robot && dishwasher);
  const sections = [
    { product: PRODUCTS[0], detail: robotDetail.data },
    { product: PRODUCTS[1], detail: dishwasherDetail.data },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product brands"
        description="Brands for the robot vacuum cleaner and the dishwasher. Brands shown here appear on the customer Services page."
      />

      {notice ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}
      {formError ? <ErrorBanner message={formError} /> : null}
      {services.error ? <ErrorBanner message={services.error} /> : null}

      {services.loading ? <p className="text-sm text-ink-muted">Loading products…</p> : null}

      {services.data && !ready ? (
        <Panel className="space-y-3 p-6">
          <h2 className="font-semibold text-ink">Set up the two products</h2>
          <p className="text-sm text-ink-muted">
            The robot vacuum cleaner and the dishwasher are not set up yet. Create them once, then you can add brands.
          </p>
          <Button onClick={createMissingProducts} disabled={busy !== null}>
            {busy === "setup" ? "Setting up…" : "Set up the two products"}
          </Button>
        </Panel>
      ) : null}

      {ready ? (
        <Panel className="space-y-4 p-6">
          <h2 className="font-semibold text-ink">Add a brand</h2>
          <form onSubmit={addBrand} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Brand name" required>
              {({ id, describedBy, invalid }) => (
                <TextInput id={id} describedBy={describedBy} invalid={invalid} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              )}
            </Field>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-ink">Products this brand is for</legend>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={forRobot} onChange={(e) => setForRobot(e.target.checked)} />
                {PRODUCTS[0]}
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={forDishwasher} onChange={(e) => setForDishwasher(e.target.checked)} />
                {PRODUCTS[1]}
              </label>
            </fieldset>
            <div className="sm:col-span-2">
              <Field label="Description" hint="Optional. Shown to customers with the brand.">
                {({ id, describedBy, invalid }) => (
                  <TextArea id={id} describedBy={describedBy} invalid={invalid} rows={3} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
                )}
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy !== null}>
                {busy === "add" ? "Adding…" : "Add brand"}
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {ready
        ? sections.map(({ product, detail }) => (
            <Panel key={product} className="space-y-3 p-6">
              <h2 className="font-semibold text-ink">{product} brands</h2>
              {detail ? (
                detail.brands.length === 0 ? (
                  <p className="text-sm text-ink-muted">No brands yet. Add one above.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {detail.brands.map((brand) => (
                      <li key={brand.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <span className="text-sm font-medium text-ink">
                          {brand.name}
                          {brand.is_active ? null : <span className="ml-2 text-xs text-ink-muted">(hidden from customers)</span>}
                        </span>
                        <div className="flex gap-3 text-sm">
                          <button
                            type="button"
                            onClick={() => toggleBrand(brand)}
                            disabled={busy !== null}
                            className="font-medium text-brand hover:underline disabled:opacity-60"
                          >
                            {brand.is_active ? "Hide from customers" : "Show to customers"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromProduct(detail, brand)}
                            disabled={busy !== null}
                            className="font-medium text-danger hover:underline disabled:opacity-60"
                          >
                            Remove from {product.toLowerCase()}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-sm text-ink-muted">Loading brands…</p>
              )}
            </Panel>
          ))
        : null}
    </div>
  );
}
