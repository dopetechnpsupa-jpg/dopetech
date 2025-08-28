import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📁 API: Getting assets...')
    
    // List files from assets bucket
    const { data: files, error } = await supabaseAdmin.storage
      .from('assets')
      .list('', { limit: 100 })
    
    if (error) {
      console.error('❌ API: Error getting assets:', error)
      return NextResponse.json(
        { error: 'Failed to get assets' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Retrieved ${files?.length || 0} assets`)
    
    return NextResponse.json(files || [])
  } catch (error) {
    console.error('❌ API: Error getting assets:', error)
    return NextResponse.json(
      { error: 'Failed to get assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📁 API: Uploading asset...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const fileName = `${Date.now()}-${file.name}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('assets')
      .upload(fileName, file)
    
    if (error) {
      console.error('❌ API: Error uploading asset:', error)
      return NextResponse.json(
        { error: 'Failed to upload asset' },
        { status: 500 }
      )
    }
    
    console.log(`✅ API: Asset uploaded: ${fileName}`)
    
    return NextResponse.json({ 
      success: true, 
      fileName: fileName,
      path: data.path 
    })
  } catch (error) {
    console.error('❌ API: Error uploading asset:', error)
    return NextResponse.json(
      { error: 'Failed to upload asset' },
      { status: 500 }
    )
  }
}
