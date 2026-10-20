"use client";

import { useCallback, useEffect, useState } from "react";
import { apiEnvelope, ApiError, PageMeta } from "@/lib/api";

type State<T> = { path: string | null; data: T | null; meta: PageMeta | null; error: string | null };

/**
 * Loads a GET endpoint from the backend. Returns the same error text the API produced.
 * Loading is derived (not set inside the effect), so an unchanged path never re-fetches on render.
 */
export function useApiData<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<State<T>>({ path: null, data: null, meta: null, error: null });

  useEffect(() => {
    if (path === null) return;
    let active = true;
    apiEnvelope<T>(path, { method: "GET" })
      .then(({ data, meta }) => {
        if (active) setState({ path, data, meta: meta ?? null, error: null });
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof ApiError ? err.message : "The data could not be loaded.";
        setState({ path, data: null, meta: null, error: message });
      });
    return () => {
      active = false;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const current = state.path === path;
  return {
    data: current ? state.data : null,
    meta: current ? state.meta : null,
    error: current ? state.error : null,
    loading: path !== null && (!current || (state.data === null && state.error === null)),
    reload,
  };
}
