import { NextRequest } from 'next/server'
import { supabaseEdge, createCachedResponse } from '@/lib/supabase-edge'

// Enable Edge Runtime for better performance and reduced egress
export const runtime = 'edge'

export async function GET() {
  try {
    console.log('🖼️ Edge API: Getting hero images...')
    
    const { data, error } = await supabaseEdge
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ Edge API: Error fetching hero images:', error)
      return Response.json({ error: 'Failed to fetch hero images' }, { status: 500 })
    }

    console.log(`✅ Edge API: Retrieved ${data?.length || 0} hero images`)
    
    // Return with cache headers for hero images (15 minutes cache)
    return createCachedResponse(data || [], 'heroImages')
  } catch (error) {
    console.error('❌ Edge API: Error getting hero images:', error)
    return Response.json(
      { error: 'Failed to get hero images' },
      { status: 500 }
    )
  }
}
