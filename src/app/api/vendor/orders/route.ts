import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const storeId = new URL(req.url).searchParams.get('vendorId')
    if (!storeId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('orders')
      .select(`
        id, order_amount, order_status, payment_status, payment_method,
        delivery_address, user_id, created_at,
        delivery_man:delivery_men!orders_delivery_man_id_fkey(f_name, l_name),
        order_details(id)
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json((data || []).map((o: any) => ({
      id: String(o.id), code: `#${o.id}`,
      customer: 'Customer', customerEmail: '',
      deliveryMan: o.delivery_man ? `${o.delivery_man.f_name || ''} ${o.delivery_man.l_name || ''}`.trim() : undefined,
      items: o.order_details?.length || 0,
      total: Number(o.order_amount), subtotal: Number(o.order_amount),
      paymentMethod: o.payment_method, paymentStatus: o.payment_status,
      status: o.order_status, address: o.delivery_address, note: undefined,
      time: o.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
