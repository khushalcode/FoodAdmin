import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/items — list items/dishes (optionally filtered by store/category/module)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const storeId = url.searchParams.get('storeId')
    const categoryId = url.searchParams.get('categoryId')
    const moduleId = url.searchParams.get('moduleId')
    const onlyActive = url.searchParams.get('active') === '1'
    const onlyApproved = url.searchParams.get('approved') === '1'

    let q = adminSupabase
      .from('items')
      .select(`
        id, name, description, image, images, price, tax, tax_type, discount, discount_type,
        veg, status, stock, slug, order_count, avg_rating, rating_count, recommended,
        organic, is_halal, is_approved, maximum_cart_quantity, featured, category_id, store_id,
        module_id, unit_id, brand_id, created_at,
        category:categories!items_category_id_fkey(name),
        store:stores!items_store_id_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (storeId) q = q.eq('store_id', storeId)
    if (categoryId) q = q.eq('category_id', categoryId)
    if (moduleId) q = q.eq('module_id', moduleId)
    if (onlyActive) q = q.eq('status', true)
    if (onlyApproved) q = q.eq('is_approved', true)

    const { data, error } = await q.limit(200)
    if (error) throw error

    return NextResponse.json((data || []).map((i: any) => ({
      id: String(i.id),
      name: i.name,
      description: i.description,
      image: i.image,
      images: i.images,
      price: Number(i.price || 0),
      tax: Number(i.tax || 0),
      taxType: i.tax_type,
      discount: Number(i.discount || 0),
      discountType: i.discount_type,
      veg: i.veg,
      status: i.status,
      active: i.status,
      stock: i.stock,
      slug: i.slug,
      orderCount: i.order_count || 0,
      avgRating: Number(i.avg_rating || 0),
      ratingCount: i.rating_count || 0,
      recommended: i.recommended,
      organic: i.organic,
      isHalal: i.is_halal,
      isApproved: i.is_approved,
      maximumCartQuantity: i.maximum_cart_quantity,
      featured: i.featured,
      categoryId: i.category_id,
      storeId: i.store_id,
      moduleId: i.module_id,
      unitId: i.unit_id,
      brandId: i.brand_id,
      categoryName: i.category?.name,
      storeName: i.store?.name,
      createdAt: i.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// POST /api/items — admin creates a new item (approved by default)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, image, price, storeId, categoryId, moduleId, tax, taxType, discount, discountType, veg, stock, slug, featured, recommended, status, isApproved } = body
    if (!name || price === undefined || !storeId || !categoryId) {
      return NextResponse.json({ error: 'name, price, storeId, categoryId required' }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from('items')
      .insert({
        name,
        description: description || null,
        image: image || null,
        price: Number(price),
        store_id: Number(storeId),
        category_id: Number(categoryId),
        module_id: moduleId || null,
        tax: Number(tax || 0),
        tax_type: taxType || 'percent',
        discount: Number(discount || 0),
        discount_type: discountType || 'percent',
        veg: veg ?? true,
        stock: stock ?? 100,
        slug: slug || `${String(name).toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        featured: featured ?? false,
        recommended: recommended ?? false,
        status: status ?? true,
        is_approved: isApproved ?? true,
        added_by: 'admin',
        order_count: 0,
        avg_rating: 0,
        rating_count: 0,
        reviews_count: 0,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: String(data?.id), ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/items — update item (incl. approve/toggle status)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (updates.name !== undefined) patch.name = updates.name
    if (updates.description !== undefined) patch.description = updates.description
    if (updates.image !== undefined) patch.image = updates.image
    if (updates.price !== undefined) patch.price = Number(updates.price)
    if (updates.tax !== undefined) patch.tax = Number(updates.tax)
    if (updates.taxType !== undefined) patch.tax_type = updates.taxType
    if (updates.discount !== undefined) patch.discount = Number(updates.discount)
    if (updates.discountType !== undefined) patch.discount_type = updates.discountType
    if (updates.veg !== undefined) patch.veg = updates.veg
    if (updates.status !== undefined) patch.status = updates.status
    if (updates.stock !== undefined) patch.stock = updates.stock
    if (updates.featured !== undefined) patch.featured = updates.featured
    if (updates.recommended !== undefined) patch.recommended = updates.recommended
    if (updates.isApproved !== undefined) patch.is_approved = updates.isApproved
    if (updates.categoryId !== undefined) patch.category_id = Number(updates.categoryId)
    if (updates.storeId !== undefined) patch.store_id = Number(updates.storeId)

    const { error } = await adminSupabase.from('items').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// DELETE /api/items?id=...
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { error } = await adminSupabase.from('items').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
