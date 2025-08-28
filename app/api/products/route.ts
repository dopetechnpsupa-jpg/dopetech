import { NextRequest } from 'next/server'
import { getProductsEdge, addProductEdge, updateProductEdge, deleteProductEdge } from '@/lib/products-data-edge'

// Enable Edge Runtime for better performance and reduced egress
export const runtime = 'edge'

export async function GET() {
  try {
    console.log('📦 Edge API: Getting products...')
    
    const response = await getProductsEdge()
    
    console.log(`✅ Edge API: Retrieved products with cache headers`)
    
    return response
  } catch (error) {
    console.error('❌ Edge API: Error getting products:', error)
    return Response.json(
      { error: 'Failed to get products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Edge API: Creating product...')
    
    const body = await request.json()
    
    const response = await addProductEdge({
      name: body.name,
      description: body.description,
      price: body.price,
      original_price: body.original_price || body.price,
      image_url: body.image_url,
      category: body.category,
      rating: body.rating || 0,
      reviews: body.reviews || 0,
      features: body.features || [],
      color: body.color || null,
      in_stock: body.in_stock,
      discount: body.discount || 0,
      hidden_on_home: body.hidden_on_home || false
    })
    
    console.log(`✅ Edge API: Product creation completed`)
    
    return response
  } catch (error) {
    console.error('❌ Edge API: Error creating product:', error)
    return Response.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📦 Edge API: Updating product...')
    
    const body = await request.json()
    const { id, ...productData } = body
    
    if (!id) {
      return Response.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const response = await updateProductEdge(id, productData)
    
    console.log(`✅ Edge API: Product update completed`)
    
    return response
  } catch (error) {
    console.error('❌ Edge API: Error updating product:', error)
    return Response.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('📦 Edge API: Deleting product...')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const response = await deleteProductEdge(parseInt(id))
    
    console.log(`✅ Edge API: Product deletion completed`)
    
    return response
  } catch (error) {
    console.error('❌ Edge API: Error deleting product:', error)
    return Response.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
