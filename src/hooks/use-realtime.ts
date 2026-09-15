"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useRealtimeTable — subscribe to Supabase Realtime postgres_changes on a table.
 *
 * Uses the anon key (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * so it respects RLS — same channel that the customer/vendor/delivery apps
 * subscribe to. When any row in the table changes, `onChange(payload)` fires
 * and the calling page can re-fetch its data.
 *
 * Usage:
 *   useRealtimeTable('orders', () => refetch())
 *   useRealtimeTable('user_notifications', () => refetch(), { filter: `user_id=eq.${userId}` })
 */

interface UseRealtimeOpts {
  filter?: string;            // e.g. "user_id=eq.abc"
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  enabled?: boolean;
}

type RtStatus = "connecting" | "subscribed" | "closed" | "error";

export function useRealtimeTable(
  table: string,
  onChange: (payload: any) => void,
  opts: UseRealtimeOpts = {},
) {
  const { filter, event = "*", schema = "public", enabled = true } = opts;
  const cbRef = useRef(onChange);
  cbRef.current = onChange;
  const [status, setStatus] = useState<RtStatus>("connecting");

  useEffect(() => {
    if (!enabled) {
      setStatus("closed");
      return;
    }
    const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setStatus("closed");
      return;
    }
    // Capture narrowed values so the async closure sees them as `string` (not `string | undefined`)
    const url: string = supabaseUrl;
    const key: string = supabaseKey;

    let channel: any = null;
    let isCancelled = false;

    async function setup() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        if (isCancelled) return;
        const client = createClient(url, key, {
          realtime: { params: { eventsPerSecond: 10 } },
        });
        const channelName = `admin:${table}:${filter || "all"}`;
        channel = client.channel(channelName);
        channel.on(
          "postgres_changes",
          { event, schema, table, filter: filter || undefined },
          (payload: any) => cbRef.current(payload),
        );
        channel.subscribe((s: string) => {
          if (isCancelled) return;
          if (s === "SUBSCRIBED") setStatus("subscribed");
          else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("error");
          else setStatus("connecting");
        });
      } catch (e) {
        if (!isCancelled) setStatus("error");
      }
    }

    setup();

    return () => {
      isCancelled = true;
      try {
        channel?.unsubscribe?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, event, schema, enabled]);

  return { status };
}
