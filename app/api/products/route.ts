import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use serverless runtime for better compatibility with Vercel
export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET() {
  try {
    console.log('📦 API: Getting products...')
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('❌ API: Error getting products:', error)
      return Response.json({ error: 'Failed to get products' }, { status: 500 })
    }

    console.log(`✅ API: Retrieved ${data?.length || 0} products`)
    return Response.json(data || [])
  } catch (error) {
    console.error('❌ API: Error getting products:', error)
    return Response.json({ error: 'Failed to get products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 API: Creating product...')
    
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.original_price || body.price,
        image_url: body.image_url,
        category: body.category,
        rating: 0,
        reviews: 0,
        features: body.features || [],
        color: body.color || null,
        in_stock: body.in_stock,
        discount: body.discount || 0,
        hidden_on_home: false
      })
      .select()
      .single()

    if (error) {
      console.error('❌ API: Error creating product:', error)
      return Response.json({ error: 'Failed to create product', details: error.message }, { status: 500 })
    }

    console.log(`✅ API: Product created with ID ${data.id}`)
    return Response.json(data)
  } catch (error) {
    console.error('❌ API: Error creating product:', error)
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📦 API: Updating product...')
    
    const body = await request.json()
    const { id, ...productData } = body
    
    if (!id) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        image_url: productData.image_url,
        category: productData.category,
        features: productData.features,
        color: productData.color,
        in_stock: productData.in_stock,
        discount: productData.discount
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ API: Error updating product:', error)
      return Response.json({ error: 'Failed to update product', details: error.message }, { status: 500 })
    }

    console.log(`✅ API: Product updated successfully`)
    return Response.json(data)
  } catch (error) {
    console.error('❌ API: Error updating product:', error)
    return Response.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📦 API: Deleting product...')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // First, delete all product images to handle foreign key constraint
    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', parseInt(id))

    if (imagesError) {
      console.error('❌ API: Error deleting product images:', imagesError)
      // Continue anyway, might not have images
    }

    // Then delete the product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('❌ API: Error deleting product:', error)
      return Response.json({ error: 'Failed to delete product', details: error.message }, { status: 500 })
    }

    console.log(`✅ API: Product deleted successfully`)
    return Response.json({ success: true })
  } catch (error) {
    console.error('❌ API: Error deleting product:', error)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
