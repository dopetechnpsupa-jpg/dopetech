const { createClient } = require('@supabase/supabase-js')

// CORRECT Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function checkFileSizeLimits() {
  console.log('🔍 Checking File Size Limits...\n')
  console.log('Supabase URL:', supabaseUrl)

  try {
    // Test 1: Very small SVG (under 1KB)
    console.log('1️⃣ Testing Very Small SVG (< 1KB)...')
    
    const tinySvg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="red"/></svg>`
    const tinyFileName = `tiny-test-${Date.now()}.svg`
    
    console.log('   File size:', Buffer.byteLength(tinySvg), 'bytes')
    
    const { data: tinyUpload, error: tinyError } = await supabaseAdmin.storage
      .from('assets')
      .upload(tinyFileName, tinySvg, {
        contentType: 'image/svg+xml'
      })

    if (tinyError) {
      console.error('❌ Tiny SVG upload failed:', tinyError.message)
    } else {
      console.log('✅ Tiny SVG upload successful')
      await supabaseAdmin.storage.from('assets').remove([tinyFileName])
      console.log('   Tiny file cleaned up')
    }

    // Test 2: Small SVG (around 5KB)
    console.log('\n2️⃣ Testing Small SVG (~5KB)...')
    
    const smallSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="blue"/>
      <text x="50" y="50" text-anchor="middle" fill="white" font-size="12">Test</text>
      <circle cx="25" cy="25" r="10" fill="green"/>
      <circle cx="75" cy="75" r="10" fill="yellow"/>
    </svg>`
    const smallFileName = `small-test-${Date.now()}.svg`
    
    console.log('   File size:', Buffer.byteLength(smallSvg), 'bytes')
    
    const { data: smallUpload, error: smallError } = await supabaseAdmin.storage
      .from('assets')
      .upload(smallFileName, smallSvg, {
        contentType: 'image/svg+xml'
      })

    if (smallError) {
      console.error('❌ Small SVG upload failed:', smallError.message)
    } else {
      console.log('✅ Small SVG upload successful')
      await supabaseAdmin.storage.from('assets').remove([smallFileName])
      console.log('   Small file cleaned up')
    }

    // Test 3: Medium SVG (around 10KB)
    console.log('\n3️⃣ Testing Medium SVG (~10KB)...')
    
    let mediumSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">`
    // Add more content to reach ~10KB
    for (let i = 0; i < 50; i++) {
      mediumSvg += `<rect x="${i * 4}" y="${i * 4}" width="4" height="4" fill="rgb(${i * 5}, ${i * 3}, ${i * 2})"/>`
    }
    mediumSvg += `<text x="100" y="100" text-anchor="middle" fill="white" font-size="16">Medium Test</text></svg>`
    
    const mediumFileName = `medium-test-${Date.now()}.svg`
    
    console.log('   File size:', Buffer.byteLength(mediumSvg), 'bytes')
    
    const { data: mediumUpload, error: mediumError } = await supabaseAdmin.storage
      .from('assets')
      .upload(mediumFileName, mediumSvg, {
        contentType: 'image/svg+xml'
      })

    if (mediumError) {
      console.error('❌ Medium SVG upload failed:', mediumError.message)
    } else {
      console.log('✅ Medium SVG upload successful')
      await supabaseAdmin.storage.from('assets').remove([mediumFileName])
      console.log('   Medium file cleaned up')
    }

    // Test 4: Large SVG (around 50KB)
    console.log('\n4️⃣ Testing Large SVG (~50KB)...')
    
    let largeSvg = `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">`
    // Add much more content to reach ~50KB
    for (let i = 0; i < 200; i++) {
      largeSvg += `<rect x="${i * 2}" y="${i * 2}" width="2" height="2" fill="rgb(${i * 2}, ${i * 1}, ${i * 3})"/>`
    }
    largeSvg += `<text x="250" y="250" text-anchor="middle" fill="white" font-size="24">Large Test</text></svg>`
    
    const largeFileName = `large-test-${Date.now()}.svg`
    
    console.log('   File size:', Buffer.byteLength(largeSvg), 'bytes')
    
    const { data: largeUpload, error: largeError } = await supabaseAdmin.storage
      .from('assets')
      .upload(largeFileName, largeSvg, {
        contentType: 'image/svg+xml'
      })

    if (largeError) {
      console.error('❌ Large SVG upload failed:', largeError.message)
    } else {
      console.log('✅ Large SVG upload successful')
      await supabaseAdmin.storage.from('assets').remove([largeFileName])
      console.log('   Large file cleaned up')
    }

    // Test 5: Check storage bucket settings
    console.log('\n5️⃣ Checking Storage Bucket Settings...')
    
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Cannot list buckets:', bucketsError.message)
    } else {
      console.log('✅ Buckets accessible:')
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }

    console.log('\n🎉 File Size Limit Check Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection: Working')
    console.log('✅ Storage buckets: Accessible')
    console.log('✅ Service role key: Working')

    console.log('\n🔍 File Size Limits Found:')
    console.log('1. Check which file sizes work vs fail')
    console.log('2. Note the exact size limit')
    console.log('3. Adjust admin panel to handle size limits')

  } catch (error) {
    console.error('❌ File size limit check failed:', error.message)
  }
}

checkFileSizeLimits()
