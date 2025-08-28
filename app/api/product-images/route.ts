import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use serverless runtime for better compatibility with file uploads
export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    console.log(`🖼️ API: Getting images for product ${productId}...`)
    
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', parseInt(productId))
      .order('display_order', { ascending: true })

    if (error) {
      console.error('❌ API: Error fetching product images:', error)
      return Response.json({ error: 'Failed to fetch product images' }, { status: 500 })
    }

    console.log(`✅ API: Retrieved ${data?.length || 0} images for product ${productId}`)
    
    return Response.json(data || [])
  } catch (error) {
    console.error('❌ API: Error getting product images:', error)
    return Response.json({ error: 'Failed to get product images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file || !productId) {
      return Response.json({ error: 'File and product ID are required' }, { status: 400 })
    }

    console.log(`🖼️ API: Uploading image for product ${productId}...`)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `product-${productId}-${Date.now()}.${fileExt}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ API: Error uploading file:', uploadError)
      return Response.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: parseInt(productId),
        image_url: urlData.publicUrl,
        file_name: fileName,
        is_primary: isPrimary,
        display_order: 0
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ API: Error saving to database:', dbError)
      return Response.json({ error: 'Failed to save metadata' }, { status: 500 })
    }

    console.log(`✅ API: Image uploaded successfully for product ${productId}`)
    
    return Response.json({
      success: true,
      image: dbData,
      message: 'Product image uploaded successfully'
    })
  } catch (error) {
    console.error('❌ API: Error uploading product image:', error)
    return Response.json({ error: 'Failed to upload product image' }, { status: 500 })
  }
}
