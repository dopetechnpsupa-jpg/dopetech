import { NextRequest } from 'next/server'
import { supabaseEdgeAdmin } from '@/lib/supabase-edge'

// Enable Edge Runtime for better performance and reduced egress
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const displayOrder = parseInt(formData.get('display_order') as string) || 0
    const showContent = formData.get('show_content') === 'true'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `hero-${Date.now()}.${fileExt}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseEdgeAdmin.storage
      .from('hero-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Edge: Error uploading file:', uploadError)
      return Response.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseEdgeAdmin.storage
      .from('hero-images')
      .getPublicUrl(fileName)

    // Save metadata to database
    const insertData = {
      image_file_name: fileName,
      image_url: urlData.publicUrl,
      title: title || '',
      subtitle: subtitle || '',
      description: description || '',
      display_order: displayOrder,
      is_active: true
    }

    // Only add show_content if the column exists (handle backward compatibility)
    try {
      const { data: dbData, error: dbError } = await supabaseEdgeAdmin
        .from('hero_images')
        .insert([{
          ...insertData,
          show_content: showContent
        }])
        .select()
        .single()

      if (dbError) {
        // If show_content column doesn't exist, try without it
        if (dbError.message?.includes('show_content')) {
          console.log('⚠️ Edge: show_content column not found, inserting without it...')
          const { data: dbData2, error: dbError2 } = await supabaseEdgeAdmin
            .from('hero_images')
            .insert([insertData])
            .select()
            .single()

          if (dbError2) {
            console.error('❌ Edge: Error saving to database:', dbError2)
            return Response.json({ error: 'Failed to save metadata' }, { status: 500 })
          }
          
          return Response.json({
            success: true,
            image: dbData2,
            message: 'Hero image uploaded successfully'
          })
        } else {
          console.error('❌ Edge: Error saving to database:', dbError)
          return Response.json({ error: 'Failed to save metadata' }, { status: 500 })
        }
      }

      return Response.json({
        success: true,
        image: dbData,
        message: 'Hero image uploaded successfully'
      })
    } catch (error) {
      console.error('❌ Edge: Error in hero image upload:', error)
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Edge: Error in hero image upload:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
