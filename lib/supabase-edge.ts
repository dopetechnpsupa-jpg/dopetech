import { createClient } from '@supabase/supabase-js'

// Edge-compatible Supabase client
// This client is optimized for Edge Functions and reduces egress data

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTUyMjUsImV4cCI6MjA3MDYzMTIyNX0.4a7Smvc_bueFLqZNvGk-AW0kD5dJusNwqaSAczJs0hU'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

// Edge-compatible client for read operations (uses anon key)
export const supabaseEdge = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'dopetech-edge'
    }
  }
})

// Edge-compatible admin client for write operations (uses service role key)
export const supabaseEdgeAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'dopetech-edge-admin'
    }
  }
})

// Cache configuration for Edge Functions
export const CACHE_CONFIG = {
  // Cache products for 5 minutes
  products: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60 // 1 minute
  },
  // Cache product images for 10 minutes
  productImages: {
    maxAge: 600, // 10 minutes
    staleWhileRevalidate: 120 // 2 minutes
  },
  // Cache hero images for 15 minutes
  heroImages: {
    maxAge: 900, // 15 minutes
    staleWhileRevalidate: 300 // 5 minutes
  }
}

// Helper function to set cache headers for Edge Functions
export function setCacheHeaders(response: Response, cacheType: keyof typeof CACHE_CONFIG) {
  const config = CACHE_CONFIG[cacheType]
  response.headers.set('Cache-Control', `public, max-age=${config.maxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`)
  response.headers.set('CDN-Cache-Control', `public, max-age=${config.maxAge}`)
  response.headers.set('Vercel-CDN-Cache-Control', `public, max-age=${config.maxAge}`)
  return response
}

// Helper function to create cached response
export function createCachedResponse(data: any, cacheType: keyof typeof CACHE_CONFIG) {
  const response = Response.json(data)
  return setCacheHeaders(response, cacheType)
}
