"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/use-realtime";

/**
 * useCrud — generic CRUD hook used by every admin list page.
 *
 * Standardizes:
 *   - fetch on mount
 *   - realtime subscription (auto-refetch on any INSERT/UPDATE/DELETE)
 *   - create / update / remove methods that POST/PATCH/DELETE to /api/<resource>
 *   - loading + error state
 *
 * Usage:
 *   const { items, loading, create, update, remove, refetch } = useCrud<Brand>({
 *     endpoint: "/api/brands",
 *     realtimeTable: "brands",
 *     mapRow: (r) => ({ id: String(r.id), ...r }),
 *     itemName: "Brand",
 *   });
 */

export interface UseCrudOptions<T> {
  endpoint: string;                          // e.g. "/api/brands"
  realtimeTable?: string;                    // e.g. "brands" — leave undefined to disable realtime
  mapRow?: (raw: any) => T;                  // optional mapper (snake_case → camelCase)
  itemName?: string;                          // for toast messages — defaults to "Record"
  enabled?: boolean;                          // default true; set false to skip initial fetch
  fallback?: T[];                             // shown when fetch fails (so the UI isn't empty)
}

export function useCrud<T extends { id: string | number }>(opts: UseCrudOptions<T>) {
  const { endpoint, realtimeTable, mapRow, itemName = "Record", enabled = true, fallback } = opts;
  const [items, setItems] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef(mapRow);
  mapRef.current = mapRow;

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.items ?? []);
      const mapped = mapRef.current ? arr.map(mapRef.current) : arr;
      setItems(mapped.length > 0 ? mapped : (fallback ?? []));
    } catch (e: any) {
      setError(e.message);
      if (fallback) setItems(fallback);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fallback]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    refetch();
  }, [refetch, enabled]);

  // Realtime — auto-refetch on any change to the table.
  // Only subscribe when realtimeTable is provided AND enabled is true.
  // (Calling the hook conditionally would violate React's rules-of-hooks, so
  // we pass a no-op table name + enabled=false when realtime isn't wanted.)
  useRealtimeTable(
    realtimeTable || "__none__",
    () => refetch(),
    { enabled: !!realtimeTable && enabled },
  );

  const create = useCallback(async (payload: Partial<T>): Promise<boolean> => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(`${itemName} created`);
      await refetch();
      return true;
    } catch (e: any) {
      toast.error(`Failed to create ${itemName.toLowerCase()}: ${e.message}`);
      return false;
    }
  }, [endpoint, itemName, refetch]);

  const update = useCallback(async (id: string | number, patch: Partial<T>): Promise<boolean> => {
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(`${itemName} updated`);
      await refetch();
      return true;
    } catch (e: any) {
      toast.error(`Failed to update ${itemName.toLowerCase()}: ${e.message}`);
      return false;
    }
  }, [endpoint, itemName, refetch]);

  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(`${itemName} deleted`);
      await refetch();
      return true;
    } catch (e: any) {
      toast.error(`Failed to delete ${itemName.toLowerCase()}: ${e.message}`);
      return false;
    }
  }, [endpoint, itemName, refetch]);

  return { items, loading, error, create, update, remove, refetch, setItems };
}
