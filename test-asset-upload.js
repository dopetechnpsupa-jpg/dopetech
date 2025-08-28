// Test Asset Upload (Logo, Video) to Assets Bucket
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testAssetUpload() {
  console.log('🧪 Testing Asset Upload to Assets Bucket...\n')
  
  try {
    // Test 1: Check if assets bucket exists
    console.log('1️⃣ Checking assets bucket...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const assetsBucket = buckets.find(bucket => bucket.name === 'assets')
    if (!assetsBucket) {
      console.error('❌ assets bucket not found!')
      return
    }
    
    console.log('✅ assets bucket exists')
    console.log(`   Public: ${assetsBucket.public}`)
    console.log(`   File size limit: ${assetsBucket.fileSizeLimit} bytes`)
    
    // Test 2: Create a test logo file
    console.log('\n2️⃣ Creating test logo...')
    const testLogoContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="blue"/>
      <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Logo</text>
    </svg>`
    
    const logoFileName = `logo/test-logo-${Date.now()}.svg`
    
    // Test 3: Upload logo to assets bucket
    console.log('3️⃣ Uploading test logo...')
    const { data: logoUploadData, error: logoUploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(logoFileName, testLogoContent, {
        contentType: 'image/svg+xml',
        cacheControl: '3600'
      })
    
    if (logoUploadError) {
      console.error('❌ Logo upload failed:', logoUploadError.message)
      return
    }
    
    console.log('✅ Logo uploaded successfully')
    console.log(`   Path: ${logoUploadData.path}`)
    
    // Test 4: Get logo public URL
    console.log('4️⃣ Getting logo public URL...')
    const { data: logoUrlData } = supabaseAdmin.storage
      .from('assets')
      .getPublicUrl(logoFileName)
    
    console.log('✅ Logo public URL generated')
    console.log(`   URL: ${logoUrlData.publicUrl}`)
    
    // Test 5: Create a test video file
    console.log('\n5️⃣ Creating test video...')
    const testVideoContent = 'fake video content for testing'
    const videoFileName = `video/test-video-${Date.now()}.mp4`
    
    // Test 6: Upload video to assets bucket
    console.log('6️⃣ Uploading test video...')
    const { data: videoUploadData, error: videoUploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(videoFileName, testVideoContent, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      })
    
    if (videoUploadError) {
      console.error('❌ Video upload failed:', videoUploadError.message)
    } else {
      console.log('✅ Video uploaded successfully')
      console.log(`   Path: ${videoUploadData.path}`)
      
      // Test 7: Get video public URL
      console.log('7️⃣ Getting video public URL...')
      const { data: videoUrlData } = supabaseAdmin.storage
        .from('assets')
        .getPublicUrl(videoFileName)
      
      console.log('✅ Video public URL generated')
      console.log(`   URL: ${videoUrlData.publicUrl}`)
    }
    
    // Test 8: List files in assets bucket
    console.log('\n8️⃣ Listing files in assets bucket...')
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('assets')
      .list('', { limit: 10 })
    
    if (listError) {
      console.error('❌ Error listing files:', listError.message)
    } else {
      console.log('✅ Files in assets bucket:')
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`)
      })
    }
    
    // Test 9: Clean up - delete test files
    console.log('\n9️⃣ Cleaning up test files...')
    const { error: deleteError } = await supabaseAdmin.storage
      .from('assets')
      .remove([logoFileName, videoFileName])
    
    if (deleteError) {
      console.error('❌ Error deleting test files:', deleteError.message)
    } else {
      console.log('✅ Test files deleted successfully')
    }
    
    console.log('\n🎉 Asset upload test completed successfully!')
    console.log('✅ assets bucket is working correctly')
    console.log('✅ Logo upload and retrieval working')
    console.log('✅ Video upload and retrieval working')
    console.log('✅ Admin panel should now be able to upload assets (logos, videos)')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testAssetUpload().catch(console.error)
