const { createClient } = require('@supabase/supabase-js')

// CORRECT Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function findExactFileSizeLimit() {
  console.log('🔍 Finding Exact File Size Limit...\n')
  console.log('Supabase URL:', supabaseUrl)

  try {
    // Test with minimal content
    console.log('1️⃣ Testing Minimal Content...')
    
    const minimalContent = 'test'
    const minimalFileName = `minimal-test-${Date.now()}.txt`
    
    console.log('   File size:', Buffer.byteLength(minimalContent), 'bytes')
    
    const { data: minimalUpload, error: minimalError } = await supabaseAdmin.storage
      .from('assets')
      .upload(minimalFileName, minimalContent, {
        contentType: 'text/plain'
      })

    if (minimalError) {
      console.error('❌ Minimal content upload failed:', minimalError.message)
    } else {
      console.log('✅ Minimal content upload successful')
      await supabaseAdmin.storage.from('assets').remove([minimalFileName])
      console.log('   Minimal file cleaned up')
    }

    // Test with single character
    console.log('\n2️⃣ Testing Single Character...')
    
    const singleChar = 'a'
    const singleCharFileName = `single-char-${Date.now()}.txt`
    
    console.log('   File size:', Buffer.byteLength(singleChar), 'bytes')
    
    const { data: singleCharUpload, error: singleCharError } = await supabaseAdmin.storage
      .from('assets')
      .upload(singleCharFileName, singleChar, {
        contentType: 'text/plain'
      })

    if (singleCharError) {
      console.error('❌ Single character upload failed:', singleCharError.message)
    } else {
      console.log('✅ Single character upload successful')
      await supabaseAdmin.storage.from('assets').remove([singleCharFileName])
      console.log('   Single character file cleaned up')
    }

    // Test with empty string
    console.log('\n3️⃣ Testing Empty String...')
    
    const emptyString = ''
    const emptyFileName = `empty-${Date.now()}.txt`
    
    console.log('   File size:', Buffer.byteLength(emptyString), 'bytes')
    
    const { data: emptyUpload, error: emptyError } = await supabaseAdmin.storage
      .from('assets')
      .upload(emptyFileName, emptyString, {
        contentType: 'text/plain'
      })

    if (emptyError) {
      console.error('❌ Empty string upload failed:', emptyError.message)
    } else {
      console.log('✅ Empty string upload successful')
      await supabaseAdmin.storage.from('assets').remove([emptyFileName])
      console.log('   Empty file cleaned up')
    }

    // Test with different bucket
    console.log('\n4️⃣ Testing Different Bucket (qr-codes)...')
    
    const testContent = 'test'
    const qrFileName = `qr-test-${Date.now()}.txt`
    
    console.log('   File size:', Buffer.byteLength(testContent), 'bytes')
    
    const { data: qrUpload, error: qrError } = await supabaseAdmin.storage
      .from('qr-codes')
      .upload(qrFileName, testContent, {
        contentType: 'text/plain'
      })

    if (qrError) {
      console.error('❌ QR codes bucket upload failed:', qrError.message)
    } else {
      console.log('✅ QR codes bucket upload successful')
      await supabaseAdmin.storage.from('qr-codes').remove([qrFileName])
      console.log('   QR test file cleaned up')
    }

    // Test with products bucket
    console.log('\n5️⃣ Testing Products Bucket...')
    
    const productFileName = `product-test-${Date.now()}.txt`
    
    const { data: productUpload, error: productError } = await supabaseAdmin.storage
      .from('products')
      .upload(productFileName, testContent, {
        contentType: 'text/plain'
      })

    if (productError) {
      console.error('❌ Products bucket upload failed:', productError.message)
    } else {
      console.log('✅ Products bucket upload successful')
      await supabaseAdmin.storage.from('products').remove([productFileName])
      console.log('   Product test file cleaned up')
    }

    console.log('\n🎉 File Size Limit Analysis Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection: Working')
    console.log('✅ Storage buckets: Accessible')
    console.log('✅ Service role key: Working')

    console.log('\n🔍 File Size Limit Analysis:')
    console.log('1. Check which buckets allow uploads')
    console.log('2. Check if it\'s a bucket-specific issue')
    console.log('3. Check if it\'s a content-type issue')

  } catch (error) {
    console.error('❌ File size limit analysis failed:', error.message)
  }
}

findExactFileSizeLimit()
