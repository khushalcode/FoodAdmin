"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SWR-like polling hook for vendor dashboard data.
 * Polls every `intervalMs` (default 5000ms). Returns `data`, `loading`, `error`.
 * Also exposes a `forceRefresh` function.
 */
export function usePoll<T>(url: string | null, intervalMs = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (mountedRef.current) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch (e: any) {
        if (mountedRef.current) {
          setError(e?.message || "Fetch failed");
          setLoading(false);
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [url, intervalMs, refreshKey]);

  const forceRefresh = () => setRefreshKey((k) => k + 1);
  return { data, loading, error, forceRefresh };
}

/**
 * One-shot fetch hook.
 */
export function useFetchOnce<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Fetch failed");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, refreshKey, ...deps]);

  const forceRefresh = () => setRefreshKey((k) => k + 1);
  return { data, loading, error, forceRefresh };
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
