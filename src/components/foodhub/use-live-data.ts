"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Mock "live" data hook for the FoodHub dashboard.
 *
 * - Initializes KPIs with reasonable starting values.
 * - Every 1s, nudges each KPI by a small random delta.
 * - Maintains a rolling 30-point series for charts.
 * - Tracks last-updated timestamp.
 * - Records which KPI just changed so the UI can flash it.
 */

export type KpiKey = "sales" | "orders" | "customers" | "aov";

export interface KpiState {
  sales: number; // total sales in USD
  orders: number; // total orders count
  customers: number; // active customers
  aov: number; // average order value in USD
}

export interface SalesPoint {
  t: string; // HH:MM:SS
  sales: number;
  profit: number;
}

export interface DayPoint {
  day: string;
  value: number;
  highlight: boolean;
}

export interface RecentOrder {
  id: string;
  customer: string;
  restaurant: string;
  items: number;
  total: number;
  status: "Pending" | "Preparing" | "On the way" | "Delivered" | "Cancelled";
  time: string;
}

const CUSTOMERS = [
  "Olivia Martin", "Liam Chen", "Sophia Patel", "Noah Williams", "Emma Garcia",
  "Mason Brown", "Ava Rodriguez", "Lucas Kim", "Mia Nguyen", "Ethan Davis",
  "Isabella Lopez", "James Wilson",
];
const RESTAURANTS = [
  "Bella Italia", "Sushi Express", "Tandoori House", "Burger Bros", "Pho Paradise",
  "Taco Loco", "Green Bowl", "Pizza Roma", "Dragon Wok", "Mediterraneo",
];
const DISHES = [
  "Margherita Pizza", "Beef Burger", "Caesar Salad", "Spicy Tuna Roll",
  "Chicken Tikka Masala", "Pad Thai", "Beef Tacos", "Avocado Toast",
  "Margherita Pasta", "Vegetable Biryani", "Tom Yum Soup", "Falafel Wrap",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function makeRecentOrder(): RecentOrder {
  const statuses: RecentOrder["status"][] = [
    "Pending", "Preparing", "On the way", "Delivered", "Cancelled",
  ];
  return {
    id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: randomFrom(CUSTOMERS),
    restaurant: randomFrom(RESTAURANTS),
    items: Math.floor(1 + Math.random() * 6),
    total: Math.round((15 + Math.random() * 85) * 100) / 100,
    status: randomFrom(statuses),
    time: nowTime(),
  };
}

const INITIAL_ORDERS: RecentOrder[] = Array.from({ length: 7 }, makeRecentOrder);

export interface LiveData {
  kpi: KpiState;
  salesSeries: SalesPoint[];
  daySeries: DayPoint[];
  recentOrders: RecentOrder[];
  lastUpdated: string;
  changedKey: KpiKey | null;
  resetChange: () => void;
}

export function useLiveData(): LiveData {
  const [kpi, setKpi] = useState<KpiState>({
    sales: 48250,
    orders: 1842,
    customers: 1247,
    aov: 26.18,
  });
  const [salesSeries, setSalesSeries] = useState<SalesPoint[]>(() =>
    Array.from({ length: 24 }, (_, i) => {
      const d = new Date(Date.now() - (24 - i) * 60_000);
      return {
        t: d.toLocaleTimeString("en-US", { hour12: false }),
        sales: 1800 + Math.round(Math.random() * 700),
        profit: 600 + Math.round(Math.random() * 280),
      };
    }),
  );
  const [daySeries, setDaySeries] = useState<DayPoint[]>([
    { day: "Mon", value: 420, highlight: false },
    { day: "Tue", value: 510, highlight: false },
    { day: "Wed", value: 380, highlight: false },
    { day: "Thu", value: 620, highlight: false },
    { day: "Fri", value: 740, highlight: false },
    { day: "Sat", value: 880, highlight: true },
    { day: "Sun", value: 530, highlight: false },
  ]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(INITIAL_ORDERS);
  const [lastUpdated, setLastUpdated] = useState<string>(nowTime());
  const [changedKey, setChangedKey] = useState<KpiKey | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetChange = useCallback(() => setChangedKey(null), []);

  useEffect(() => {
    const tick = setInterval(() => {
      setKpi((prev) => {
        const salesDelta = Math.round((Math.random() * 18) * 100) / 100;
        const ordersDelta = Math.floor(Math.random() * 4);
        const customersDelta = Math.floor(Math.random() * 3);
        const newAov =
          Math.round(
            ((prev.sales + salesDelta) / Math.max(1, prev.orders + ordersDelta)) * 100,
          ) / 100;
        // Mark which KPI changed this tick
        const keys: KpiKey[] = ["sales", "orders", "customers", "aov"];
        const key = keys[Math.floor(Math.random() * keys.length)];
        setChangedKey(key);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setChangedKey(null), 600);
        return {
          sales: Math.round((prev.sales + salesDelta) * 100) / 100,
          orders: prev.orders + ordersDelta,
          customers: prev.customers + customersDelta,
          aov: newAov,
        };
      });

      // push a new sales point
      setSalesSeries((prev) => {
        const next = [
          ...prev,
          {
            t: nowTime(),
            sales: 1800 + Math.round(Math.random() * 700),
            profit: 600 + Math.round(Math.random() * 280),
          },
        ];
        if (next.length > 30) next.shift();
        return next;
      });

      // re-randomize day series slightly + highlight "today"
      setDaySeries((prev) => {
        const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6
        return prev.map((d, i) => ({
          ...d,
          value: Math.max(200, d.value + Math.floor((Math.random() - 0.5) * 40)),
          highlight: i === todayIdx,
        }));
      });

      setLastUpdated(nowTime());
    }, 1000);

    const ordersTick = setInterval(() => {
      setRecentOrders((prev) => [makeRecentOrder(), ...prev].slice(0, 8));
    }, 6000);

    return () => {
      clearInterval(tick);
      clearInterval(ordersTick);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  return {
    kpi,
    salesSeries,
    daySeries,
    recentOrders,
    lastUpdated,
    changedKey,
    resetChange,
  };
}

/** Smoothly count a number from 0 to `target` over `durationMs`. */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = 0;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
