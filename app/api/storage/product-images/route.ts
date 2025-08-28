import { NextRequest } from 'next/server'
import { supabaseEdge, supabaseEdgeAdmin, createCachedResponse } from '@/lib/supabase-edge'

// Enable Edge Runtime for better performance and reduced egress
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    console.log('🖼️ Edge Storage API: Getting product images...')
    
    if (fileName) {
      // Get specific file
      const { data, error } = await supabaseEdge.storage
        .from('product-images')
        .getPublicUrl(fileName)
      
      if (error) {
        console.error('❌ Edge Storage API: Error getting file:', error)
        return Response.json({ error: 'Failed to get file' }, { status: 500 })
      }
      
      return Response.json({ url: data.publicUrl })
    } else {
      // List all files
      const { data, error } = await supabaseEdge.storage
        .from('product-images')
        .list()
      
      if (error) {
        console.error('❌ Edge Storage API: Error listing files:', error)
        return Response.json({ error: 'Failed to list files' }, { status: 500 })
      }
      
      return createCachedResponse(data || [], 'productImages')
    }
  } catch (error) {
    console.error('❌ Edge Storage API: Error:', error)
    return Response.json({ error: 'Storage operation failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json({ error: 'File is required' }, { status: 400 })
    }
    
    console.log('🖼️ Edge Storage API: Uploading product image...')
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `product-${Date.now()}.${fileExt}`
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseEdgeAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })
    
    if (error) {
      console.error('❌ Edge Storage API: Error uploading:', error)
      return Response.json({ error: 'Failed to upload file' }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabaseEdgeAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)
    
    console.log('✅ Edge Storage API: Product image uploaded successfully')
    
    return Response.json({ 
      success: true, 
      fileName: data.path,
      url: urlData.publicUrl 
    })
  } catch (error) {
    console.error('❌ Edge Storage API: Error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    
    if (!fileName) {
      return Response.json({ error: 'File name is required' }, { status: 400 })
    }
    
    console.log('🖼️ Edge Storage API: Deleting product image...')
    
    const { error } = await supabaseEdgeAdmin.storage
      .from('product-images')
      .remove([fileName])
    
    if (error) {
      console.error('❌ Edge Storage API: Error deleting:', error)
      return Response.json({ error: 'Failed to delete file' }, { status: 500 })
    }
    
    console.log('✅ Edge Storage API: Product image deleted successfully')
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('❌ Edge Storage API: Error:', error)
    return Response.json({ error: 'Delete failed' }, { status: 500 })
  }
}
