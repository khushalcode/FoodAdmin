import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const storeId = new URL(req.url).searchParams.get('vendorId')
    if (!storeId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    const { data, error } = await adminSupabase
      .from('items')
      .select(`
        id, name, slug, image, description, price, discount, stock, veg, status,
        avg_rating, order_count,
        category:categories!items_category_id_fkey(name), category_id
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((p: any) => ({
      id: String(p.id), name: p.name, slug: p.slug || String(p.id), image: p.image,
      description: p.description, price: Number(p.price), discount: Number(p.discount),
      stock: p.stock || 0, unit: 'piece', isVeg: p.veg, isFeatured: false,
      isActive: p.status, rating: Number(p.avg_rating) || 0, totalSold: p.order_count || 0,
      category: p.category?.name, categoryId: p.category_id ? String(p.category_id) : null,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
