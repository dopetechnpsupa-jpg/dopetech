import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use serverless runtime for better compatibility with file uploads
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
    console.log('📁 API: Getting assets...')
    
    // List files from assets bucket
    const { data: files, error } = await supabaseAdmin.storage
      .from('assets')
      .list('', { limit: 100 })
    
    if (error) {
      console.error('❌ API: Error getting assets:', error)
      return Response.json({ error: 'Failed to get assets' }, { status: 500 })
    }
    
    console.log(`✅ API: Retrieved ${files?.length || 0} assets`)
    
    return Response.json(files || [])
  } catch (error) {
    console.error('❌ API: Error getting assets:', error)
    return Response.json({ error: 'Failed to get assets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Uploading asset...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const fileName = `${Date.now()}-${file.name}`
    
    // Convert file to buffer for better compatibility
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const { data, error } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })
    
    if (error) {
      console.error('❌ API: Error uploading asset:', error)
      return Response.json({ error: 'Failed to upload asset' }, { status: 500 })
    }
    
    console.log(`✅ API: Asset uploaded: ${fileName}`)
    
    return Response.json({ 
      success: true, 
      fileName: fileName,
      path: data.path 
    })
  } catch (error) {
    console.error('❌ API: Error uploading asset:', error)
    return Response.json({ error: 'Failed to upload asset' }, { status: 500 })
  }
}
