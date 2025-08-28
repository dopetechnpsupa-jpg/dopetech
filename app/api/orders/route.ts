import { NextRequest } from 'next/server'
import { supabaseEdgeAdmin, createCachedResponse } from '@/lib/supabase-edge'

// Enable Edge Runtime for better performance and reduced egress
export const runtime = 'edge'

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (orderId) {
      // Get specific order
      const { data, error } = await supabaseEdgeAdmin
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        return Response.json({ error: 'Order not found' }, { status: 404 })
      }

      return Response.json({ order: data })
    } else {
      // Get all orders
      const { data, error } = await supabaseEdgeAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return Response.json({ error: 'Failed to get orders' }, { status: 500 })
      }

      // Cache orders for 2 minutes since they don't change frequently
      const response = Response.json(data || [])
      response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30')
      return response
    }
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseEdgeAdmin
      .from('orders')
      .insert([body])
      .select()
      .single()

    if (error) {
      return Response.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return Response.json({ order: data })
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🔄 Edge API: Updating order status...')
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    const body = await request.json()
    const { orderId, order_status } = body
    
    if (!orderId || !order_status) {
      return Response.json(
        { error: 'Missing required fields: orderId and order_status' },
        { status: 400, headers }
      )
    }
    
    console.log(`📝 Edge API: Updating order ${orderId} status to: ${order_status}`)
    
    const { data, error } = await supabaseEdgeAdmin
      .from('orders')
      .update({ 
        order_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
    
    if (error) {
      console.error('❌ Edge API: Error updating order status:', error)
      return Response.json(
        { error: `Failed to update order status: ${error.message}` },
        { status: 500, headers }
      )
    }
    
    if (!data || data.length === 0) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404, headers }
      )
    }
    
    console.log('✅ Edge API: Order status updated successfully')
    
    return Response.json({
      success: true,
      message: 'Order status updated successfully',
      order: data[0]
    }, { headers })
    
  } catch (error) {
    console.error('❌ Edge API: Error updating order status:', error)
    return Response.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }}
    )
  }
}
