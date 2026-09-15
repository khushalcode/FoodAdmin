import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type PromoItem = {
  id: string
  type: 'banner' | 'coupon' | 'campaign' | 'flash_sale'
  title: string | null
  status: any
  startDate: string | null
  endDate: string | null
}

// GET /api/promotions — read-only aggregation of banners + coupons + campaigns + flash_sales.
// Each source is wrapped in its own try/catch so a missing table or column
// doesn't break the whole response — we just skip that source.
export async function GET() {
  const out: PromoItem[] = []

  // 1. Banners
  try {
    const { data, error } = await adminSupabase
      .from('banners')
      .select('id, title, status, start_date, end_date')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) {
      for (const b of data) {
        out.push({
          id: String(b.id),
          type: 'banner',
          title: b.title ?? null,
          status: b.status,
          startDate: b.start_date ?? null,
          endDate: b.end_date ?? null,
        })
      }
    }
  } catch {
    // skip
  }

  // 2. Coupons
  try {
    const { data, error } = await adminSupabase
      .from('coupons')
      .select('id, title, status, start_date, expire_date')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) {
      for (const c of data) {
        out.push({
          id: String(c.id),
          type: 'coupon',
          title: c.title ?? null,
          status: c.status,
          startDate: c.start_date ?? null,
          endDate: c.expire_date ?? null,
        })
      }
    }
  } catch {
    // skip
  }

  // 3. Campaigns
  try {
    const { data, error } = await adminSupabase
      .from('campaigns')
      .select('id, title, status, start_date, end_date')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) {
      for (const c of data) {
        out.push({
          id: String(c.id),
          type: 'campaign',
          title: c.title ?? null,
          status: c.status,
          startDate: c.start_date ?? null,
          endDate: c.end_date ?? null,
        })
      }
    }
  } catch {
    // skip
  }

  // 4. Flash Sales
  try {
    const { data, error } = await adminSupabase
      .from('flash_sales')
      .select('id, title, is_publish, start_date, end_date')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) {
      for (const f of data) {
        out.push({
          id: String(f.id),
          type: 'flash_sale',
          title: f.title ?? null,
          status: f.is_publish,
          startDate: f.start_date ?? null,
          endDate: f.end_date ?? null,
        })
      }
    }
  } catch {
    // skip
  }

  return NextResponse.json(out)
}
