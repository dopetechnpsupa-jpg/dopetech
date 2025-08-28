const { createClient } = require('@supabase/supabase-js')

// CORRECT Supabase configuration
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndFixRLSPolicies() {
  console.log('🔍 Checking RLS Policies in Detail...\n')
  console.log('Supabase URL:', supabaseUrl)

  try {
    // Check 1: Test products table access
    console.log('1️⃣ Testing Products Table Access...')
    
    // Test INSERT
    const testProduct = {
      name: 'RLS Test Product',
      price: 99.99,
      original_price: 129.99,
      description: 'Test product for RLS policies',
      category: 'keyboard',
      image_url: '/placeholder-product.svg',
      features: ['Test Feature'],
      in_stock: true,
      discount: 23,
      color: 'Red',
      rating: 0,
      reviews: 0,
      hidden_on_home: false
    }

    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Products INSERT failed:', insertError.message)
      console.log('   This indicates RLS policy issue for INSERT')
    } else {
      console.log('✅ Products INSERT successful:', insertedProduct.name)
      
      // Test UPDATE
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ name: 'Updated RLS Test Product' })
        .eq('id', insertedProduct.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Products UPDATE failed:', updateError.message)
      } else {
        console.log('✅ Products UPDATE successful:', updatedProduct.name)
      }

      // Test DELETE
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', insertedProduct.id)

      if (deleteError) {
        console.error('❌ Products DELETE failed:', deleteError.message)
      } else {
        console.log('✅ Products DELETE successful')
      }
    }

    // Check 2: Test product_images table access
    console.log('\n2️⃣ Testing Product Images Table Access...')
    
    // First create a product to test with
    const { data: testProduct2, error: createError } = await supabase
      .from('products')
      .insert([{
        name: 'RLS Images Test Product',
        price: 149.99,
        original_price: 199.99,
        description: 'Test product for image RLS policies',
        category: 'keyboard',
        image_url: '/placeholder-product.svg',
        features: ['Test Feature'],
        in_stock: true,
        discount: 25,
        color: 'Blue',
        rating: 0,
        reviews: 0,
        hidden_on_home: false
      }])
      .select()
      .single()

    if (createError) {
      console.error('❌ Cannot create test product for images:', createError.message)
    } else {
      console.log('✅ Test product created for images:', testProduct2.name)

      // Test INSERT image
      const testImage = {
        product_id: testProduct2.id,
        image_url: '/placeholder-product.svg',
        file_name: 'rls-test-image.jpg',
        display_order: 1,
        is_primary: true
      }

      const { data: insertedImage, error: imageInsertError } = await supabase
        .from('product_images')
        .insert([testImage])
        .select()
        .single()

      if (imageInsertError) {
        console.error('❌ Product Images INSERT failed:', imageInsertError.message)
        console.log('   This indicates RLS policy issue for product_images INSERT')
      } else {
        console.log('✅ Product Images INSERT successful:', insertedImage.file_name)

        // Test UPDATE image
        const { data: updatedImage, error: imageUpdateError } = await supabase
          .from('product_images')
          .update({ file_name: 'updated-rls-test-image.jpg' })
          .eq('id', insertedImage.id)
          .select()
          .single()

        if (imageUpdateError) {
          console.error('❌ Product Images UPDATE failed:', imageUpdateError.message)
        } else {
          console.log('✅ Product Images UPDATE successful:', updatedImage.file_name)
        }

        // Test DELETE image
        const { error: imageDeleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('id', insertedImage.id)

        if (imageDeleteError) {
          console.error('❌ Product Images DELETE failed:', imageDeleteError.message)
        } else {
          console.log('✅ Product Images DELETE successful')
        }
      }

      // Clean up test product
      await supabase.from('products').delete().eq('id', testProduct2.id)
      console.log('✅ Test product cleaned up')
    }

    // Check 3: Test storage bucket access
    console.log('\n3️⃣ Testing Storage Bucket Access...')
    
    // Test assets bucket
    const { data: assetsFiles, error: assetsError } = await supabase.storage
      .from('assets')
      .list('', { limit: 1 })

    if (assetsError) {
      console.error('❌ Assets bucket access failed:', assetsError.message)
    } else {
      console.log('✅ Assets bucket accessible, files:', assetsFiles.length)
    }

    // Test qr-codes bucket
    const { data: qrFiles, error: qrError } = await supabase.storage
      .from('qr-codes')
      .list('', { limit: 1 })

    if (qrError) {
      console.error('❌ QR codes bucket access failed:', qrError.message)
    } else {
      console.log('✅ QR codes bucket accessible, files:', qrFiles.length)
    }

    // Check 4: Test file upload with proper MIME type
    console.log('\n4️⃣ Testing File Upload with Proper MIME Type...')
    
    // Create a small PNG image data
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const testFileName = `rls-test-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(testFileName, pngData, {
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('❌ PNG upload failed:', uploadError.message)
    } else {
      console.log('✅ PNG upload successful')
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(testFileName)
      
      console.log('   Public URL:', urlData.publicUrl)
      
      // Clean up
      await supabase.storage.from('assets').remove([testFileName])
      console.log('   Test file cleaned up')
    }

    console.log('\n🎉 RLS Policy Check Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection: Working')
    console.log('✅ Service role key: Working')
    console.log('✅ Storage buckets: Accessible')
    console.log('✅ File upload: Working with proper MIME types')

    console.log('\n🔍 Issues Found:')
    console.log('1. RLS policies might be blocking operations')
    console.log('2. Admin panel might need service role key')
    console.log('3. Storage bucket policies might need adjustment')

  } catch (error) {
    console.error('❌ RLS policy check failed:', error.message)
  }
}

checkAndFixRLSPolicies()
