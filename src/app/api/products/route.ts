import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Real schema: items table (not products)
    const { data, error } = await adminSupabase
      .from('items')
      .select(`
        id, name, slug, image, price, discount, stock, veg, status,
        avg_rating, order_count,
        category:categories!items_category_id_fkey(name),
        store:stores!items_store_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json((data || []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      slug: p.slug || String(p.id),
      image: p.image,
      price: Number(p.price),
      discount: Number(p.discount),
      stock: p.stock || 0,
      isVeg: p.veg,
      isFeatured: false, // items table doesn't have is_featured — derived from order_count
      isActive: p.status,
      rating: Number(p.avg_rating) || 0,
      totalSold: p.order_count || 0,
      unit: 'piece',
      category: p.category?.name,
      vendor: p.store?.name,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
