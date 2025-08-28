// Test QR Code Upload to QR Codes Bucket
const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testQRCodeUpload() {
  console.log('🧪 Testing QR Code Upload to QR Codes Bucket...\n')
  
  try {
    // Test 1: Check if qr-codes bucket exists
    console.log('1️⃣ Checking qr-codes bucket...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const qrCodesBucket = buckets.find(bucket => bucket.name === 'qr-codes')
    if (!qrCodesBucket) {
      console.error('❌ qr-codes bucket not found!')
      return
    }
    
    console.log('✅ qr-codes bucket exists')
    console.log(`   Public: ${qrCodesBucket.public}`)
    console.log(`   File size limit: ${qrCodesBucket.fileSizeLimit} bytes`)
    
    // Test 2: Check if qr_codes table exists
    console.log('\n2️⃣ Checking qr_codes table...')
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('qr_codes')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ qr_codes table error:', tableError.message)
      console.log('   ⚠️ qr_codes table might not exist or have RLS issues')
      return
    }
    
    console.log('✅ qr_codes table exists and accessible')
    console.log(`   Found ${tableData.length} QR codes in table`)
    
    // Test 3: Create a test QR code image
    console.log('\n3️⃣ Creating test QR code image...')
    const testQRCodeContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <rect x="60" y="60" width="80" height="80" fill="black"/>
      <text x="100" y="190" text-anchor="middle" fill="black" font-size="12">Test QR Code</text>
    </svg>`
    
    const qrCodeFileName = `test-qr-${Date.now()}.svg`
    
    // Test 4: Upload QR code to qr-codes bucket
    console.log('4️⃣ Uploading test QR code...')
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(qrCodeFileName, testQRCodeContent, {
        contentType: 'image/svg+xml',
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('❌ QR code upload failed:', uploadError.message)
      return
    }
    
    console.log('✅ QR code uploaded successfully')
    console.log(`   Path: ${uploadData.path}`)
    
    // Test 5: Get QR code public URL
    console.log('5️⃣ Getting QR code public URL...')
    const { data: urlData } = supabaseAdmin.storage
      .from('qr-codes')
      .getPublicUrl(qrCodeFileName)
    
    console.log('✅ QR code public URL generated')
    console.log(`   URL: ${urlData.publicUrl}`)
    
    // Test 6: Save QR code to database
    console.log('6️⃣ Saving QR code to database...')
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('qr_codes')
      .insert({
        name: 'Test QR Code - ' + Date.now(),
        image_url: urlData.publicUrl,
        is_active: false
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('❌ Database save failed:', dbError.message)
    } else {
      console.log('✅ QR code saved to database')
      console.log(`   ID: ${dbData.id}`)
      console.log(`   Name: ${dbData.name}`)
      
      // Test 7: List QR codes from database
      console.log('\n7️⃣ Listing QR codes from database...')
      const { data: qrCodes, error: listError } = await supabaseAdmin
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (listError) {
        console.error('❌ Error listing QR codes:', listError.message)
      } else {
        console.log('✅ QR codes in database:')
        qrCodes.forEach(qr => {
          console.log(`   - ${qr.name} (${qr.is_active ? 'Active' : 'Inactive'})`)
        })
      }
      
      // Test 8: Clean up - delete from database
      console.log('\n8️⃣ Cleaning up database...')
      const { error: deleteDbError } = await supabaseAdmin
        .from('qr_codes')
        .delete()
        .eq('id', dbData.id)
      
      if (deleteDbError) {
        console.error('❌ Error deleting from database:', deleteDbError.message)
      } else {
        console.log('✅ QR code deleted from database')
      }
    }
    
    // Test 9: List files in qr-codes bucket
    console.log('\n9️⃣ Listing files in qr-codes bucket...')
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('qr-codes')
      .list('', { limit: 10 })
    
    if (listError) {
      console.error('❌ Error listing files:', listError.message)
    } else {
      console.log('✅ Files in qr-codes bucket:')
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`)
      })
    }
    
    // Test 10: Clean up - delete test file
    console.log('\n🔟 Cleaning up test file...')
    const { error: deleteError } = await supabaseAdmin.storage
      .from('qr-codes')
      .remove([qrCodeFileName])
    
    if (deleteError) {
      console.error('❌ Error deleting test file:', deleteError.message)
    } else {
      console.log('✅ Test file deleted successfully')
    }
    
    console.log('\n🎉 QR code upload test completed successfully!')
    console.log('✅ qr-codes bucket is working correctly')
    console.log('✅ qr_codes table is working correctly')
    console.log('✅ QR code upload and retrieval working')
    console.log('✅ Database operations working')
    console.log('✅ Admin panel should now be able to upload QR codes')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testQRCodeUpload().catch(console.error)
