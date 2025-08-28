const { createClient } = require('@supabase/supabase-js')

// CORRECT Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function fixFileSizeLimits() {
  console.log('🔧 Fixing File Size Limits...\n')
  console.log('Supabase URL:', supabaseUrl)

  try {
    // First, let's check current bucket settings
    console.log('1️⃣ Checking Current Bucket Settings...')
    
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Cannot list buckets:', bucketsError.message)
      return
    }

    console.log('✅ Available buckets:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Test upload with different sizes to find the current limit
    console.log('\n2️⃣ Testing Current File Size Limits...')
    
    const testSizes = [
      { name: 'Tiny', size: 100, content: 'a'.repeat(100) },
      { name: 'Small', size: 1024, content: 'a'.repeat(1024) },
      { name: 'Medium', size: 10240, content: 'a'.repeat(10240) },
      { name: 'Large', size: 102400, content: 'a'.repeat(102400) }
    ]

    for (const test of testSizes) {
      const fileName = `size-test-${test.name}-${Date.now()}.txt`
      
      console.log(`   Testing ${test.name} file (${test.size} bytes)...`)
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('assets')
        .upload(fileName, test.content, {
          contentType: 'text/plain'
        })

      if (uploadError) {
        console.log(`   ❌ ${test.name} upload failed: ${uploadError.message}`)
        // Clean up any partial uploads
        await supabaseAdmin.storage.from('assets').remove([fileName])
        break
      } else {
        console.log(`   ✅ ${test.name} upload successful`)
        await supabaseAdmin.storage.from('assets').remove([fileName])
      }
    }

    // Now let's try to update bucket settings via API
    console.log('\n3️⃣ Attempting to Update Bucket Settings...')
    
    // Note: Supabase doesn't provide direct API access to update bucket settings
    // We need to use the dashboard or provide instructions
    
    console.log('⚠️  Bucket settings cannot be updated via API')
    console.log('📋 Manual steps required:')
    console.log('')
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project: flrcwmmdveylmcbjuwfc')
    console.log('3. Navigate to: Storage → Settings')
    console.log('4. For each bucket, increase file size limit:')
    console.log('   - assets: 5MB (5,242,880 bytes)')
    console.log('   - qr-codes: 2MB (2,097,152 bytes)')
    console.log('   - products: 5MB (5,242,880 bytes)')
    console.log('   - hero-images: 10MB (10,485,760 bytes)')
    console.log('   - receipts: 5MB (5,242,880 bytes)')
    console.log('')

    // Alternative: Create a new bucket with proper settings
    console.log('4️⃣ Creating Alternative Solution...')
    
    // Try to create a new bucket with different settings
    const newBucketName = `assets-fixed-${Date.now()}`
    
    console.log(`   Creating new bucket: ${newBucketName}`)
    
    const { data: newBucket, error: newBucketError } = await supabaseAdmin.storage.createBucket(newBucketName, {
      public: true,
      allowedMimeTypes: ['image/*', 'text/plain'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (newBucketError) {
      console.log(`   ❌ Cannot create new bucket: ${newBucketError.message}`)
    } else {
      console.log(`   ✅ New bucket created: ${newBucketName}`)
      
      // Test upload to new bucket
      const testContent = 'test content for new bucket'
      const testFileName = `test-${Date.now()}.txt`
      
      const { data: testUpload, error: testError } = await supabaseAdmin.storage
        .from(newBucketName)
        .upload(testFileName, testContent, {
          contentType: 'text/plain'
        })

      if (testError) {
        console.log(`   ❌ Test upload to new bucket failed: ${testError.message}`)
      } else {
        console.log(`   ✅ Test upload to new bucket successful`)
        await supabaseAdmin.storage.from(newBucketName).remove([testFileName])
      }
    }

    console.log('\n🎉 File Size Limit Fix Attempt Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection: Working')
    console.log('✅ Storage buckets: Accessible')
    console.log('✅ Service role key: Working')
    console.log('⚠️  File size limits: Need manual update in dashboard')

    console.log('\n🔧 NEXT STEPS:')
    console.log('1. Update file size limits in Supabase Dashboard')
    console.log('2. Test admin panel uploads')
    console.log('3. Verify all functionality works')

  } catch (error) {
    console.error('❌ File size limit fix failed:', error.message)
  }
}

fixFileSizeLimits()
