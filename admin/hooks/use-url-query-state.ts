"use client";

import { useCallback, useEffect, useState } from "react";

type HistoryMode = "push" | "replace";

const QUERY_CHANGE_EVENT = "highkey:url-query-change";

function readParam(name: string, defaultValue: string) {
  if (typeof window === "undefined") return defaultValue;
  return new URLSearchParams(window.location.search).get(name) ?? defaultValue;
}

function updateUrl(
  updater: (params: URLSearchParams) => void,
  mode: HistoryMode = "replace",
) {
  const params = new URLSearchParams(window.location.search);
  updater(params);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

  window.history[mode === "push" ? "pushState" : "replaceState"](
    null,
    "",
    nextUrl,
  );
  window.dispatchEvent(new Event(QUERY_CHANGE_EVENT));
}

export function useUrlQueryParam(name: string, defaultValue = "") {
  const [value, setValue] = useState(() => readParam(name, defaultValue));

  useEffect(() => {
    function syncFromUrl() {
      setValue(readParam(name, defaultValue));
    }

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(QUERY_CHANGE_EVENT, syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(QUERY_CHANGE_EVENT, syncFromUrl);
    };
  }, [name, defaultValue]);

  const setQueryValue = useCallback(
    (
      nextValue: string,
      options: { mode?: HistoryMode; resetPage?: boolean } = {},
    ) => {
      if (typeof window === "undefined") return;

      const normalizedValue = nextValue.trim();
      updateUrl((params) => {
        if (normalizedValue && normalizedValue !== defaultValue) {
          params.set(name, normalizedValue);
        } else {
          params.delete(name);
        }

        if (options.resetPage) {
          params.delete("page");
        }
      }, options.mode);
    },
    [name, defaultValue],
  );

  return [value, setQueryValue] as const;
}

export function useUrlPageParam(name = "page") {
  const [rawPage] = useUrlQueryParam(name, "1");

  const page = Math.max(1, Number.parseInt(rawPage, 10) || 1);

  const setPage = useCallback(
    (nextPage: number) => {
      if (typeof window === "undefined") return;

      const normalizedPage = Math.max(1, Math.trunc(nextPage));
      updateUrl((params) => {
        if (normalizedPage > 1) {
          params.set(name, String(normalizedPage));
        } else {
          params.delete(name);
        }
      }, "push");
    },
    [name],
  );

  return [page, setPage] as const;
}
