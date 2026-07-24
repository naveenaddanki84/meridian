"use client";

import { useEffect, useState } from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Tiny data-fetching hook over the mock API: real loading and error
 * states without a query-library dependency.
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: "Something went wrong loading this. Try refreshing the page.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
