import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Real schema: stores table (food storefronts)
    const { data, error } = await adminSupabase
      .from('stores')
      .select(`
        id, name, slug, phone, email, address, lat, lng,
        rating, rating_count, active, featured, status,
        minimum_order, comission, zone_id, module_id, vendor_id,
        created_at,
        vendor:vendors!stores_vendor_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const withCounts = await Promise.all((data || []).map(async (s: any) => {
      const sid = String(s.id)
      const [{ count: productCount }, { count: orderCount }] = await Promise.all([
        adminSupabase.from('items').select('id', { count: 'exact', head: true }).eq('store_id', s.id),
        adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', s.id),
      ])
      return {
        id: sid,
        name: s.name,
        slug: s.slug || sid,
        owner: s.vendor?.name || '—',
        email: s.email || s.vendor?.email || '',
        phone: s.phone,
        address: s.address,
        city: '',
        rating: Number(s.rating) || 0,
        reviewCount: s.rating_count || 0,
        isVerified: Boolean(s.active),
        isActive: Boolean(s.status),
        openTime: '09:00',
        closeTime: '22:00',
        balance: 0,
        commissionPct: Number(s.comission) || 0,
        productCount: productCount || 0,
        orderCount: orderCount || 0,
        createdAt: s.created_at,
      }
    }))

    return NextResponse.json(withCounts)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
