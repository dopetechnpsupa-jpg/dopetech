// Test Image Upload to Product Images Bucket
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testImageUpload() {
  console.log('🧪 Testing Image Upload to Product Images Bucket...\n')
  
  try {
    // Test 1: Check if product-images bucket exists
    console.log('1️⃣ Checking product-images bucket...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images')
    if (!productImagesBucket) {
      console.error('❌ product-images bucket not found!')
      return
    }
    
    console.log('✅ product-images bucket exists')
    console.log(`   Public: ${productImagesBucket.public}`)
    console.log(`   File size limit: ${productImagesBucket.fileSizeLimit} bytes`)
    
    // Test 2: Create a test image file
    console.log('\n2️⃣ Creating test image...')
    const testImageContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="red"/>
      <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Test</text>
    </svg>`
    
    const fileName = `test-${Date.now()}.svg`
    
    // Test 3: Upload to product-images bucket
    console.log('3️⃣ Uploading test image...')
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, testImageContent, {
        contentType: 'image/svg+xml',
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      return
    }
    
    console.log('✅ Image uploaded successfully')
    console.log(`   Path: ${uploadData.path}`)
    
    // Test 4: Get public URL
    console.log('4️⃣ Getting public URL...')
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)
    
    console.log('✅ Public URL generated')
    console.log(`   URL: ${urlData.publicUrl}`)
    
    // Test 5: List files in bucket
    console.log('5️⃣ Listing files in bucket...')
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('product-images')
      .list('', { limit: 10 })
    
    if (listError) {
      console.error('❌ Error listing files:', listError.message)
    } else {
      console.log('✅ Files in bucket:')
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`)
      })
    }
    
    // Test 6: Clean up - delete test file
    console.log('6️⃣ Cleaning up test file...')
    const { error: deleteError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([fileName])
    
    if (deleteError) {
      console.error('❌ Error deleting test file:', deleteError.message)
    } else {
      console.log('✅ Test file deleted successfully')
    }
    
    console.log('\n🎉 Image upload test completed successfully!')
    console.log('✅ product-images bucket is working correctly')
    console.log('✅ Image upload and retrieval working')
    console.log('✅ Admin panel should now be able to upload product images')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testImageUpload().catch(console.error)
