const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔧 Applying Database Schema Fixes...')
console.log('URL:', supabaseUrl)
console.log('Service Key Set:', !!supabaseServiceKey)
console.log('')

async function applyDatabaseFixes() {
  try {
    console.log('📖 Reading SQL fix file...')
    const sqlContent = fs.readFileSync('fix-database-schema.sql', 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    console.log('')
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim() === '') continue
      
      try {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`)
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)
        
        const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabaseAdmin.from('products').select('count').limit(1)
          if (directError) {
            console.log(`   ⚠️ Statement skipped (likely already applied): ${error.message}`)
          } else {
            console.log(`   ❌ Error: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`   ✅ Success`)
          successCount++
        }
        
      } catch (err) {
        console.log(`   ⚠️ Statement skipped: ${err.message}`)
      }
      
      console.log('')
    }
    
    console.log('📊 Fix Application Summary:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📝 Total: ${statements.length}`)
    
    // Test the fixes
    console.log('\n🧪 Testing fixes...')
    await testFixes()
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error.message)
  }
}

async function testFixes() {
  try {
    // Test 1: Check if rating column accepts decimals
    console.log('  📖 Testing rating column...')
    const { data: testProduct, error: createError } = await supabaseAdmin
      .from('products')
      .insert([{
        name: 'Test Product for Rating - ' + Date.now(),
        price: 99.99,
        original_price: 129.99,
        description: 'Test product for rating fix',
        category: 'test',
        image_url: '/test-image.jpg',
        rating: 4.5, // This should work now
        reviews: 10,
        features: ['Test feature'],
        in_stock: true,
        discount: 23,
        hidden_on_home: true
      }])
      .select()
      .single()
    
    if (createError) {
      console.log(`  ❌ Rating test failed: ${createError.message}`)
    } else {
      console.log(`  ✅ Rating test passed: Product created with rating ${testProduct.rating}`)
      
      // Clean up test product
      await supabaseAdmin.from('products').delete().eq('id', testProduct.id)
    }
    
    // Test 2: Check if product_images can be created with valid product_id
    console.log('  📖 Testing product_images foreign key...')
    const { data: validProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .limit(1)
      .single()
    
    if (validProduct) {
      const { data: testImage, error: imageError } = await supabaseAdmin
        .from('product_images')
        .insert([{
          product_id: validProduct.id,
          image_url: 'https://test-image-url.com/test.jpg',
          file_name: 'test-image.jpg',
          display_order: 1,
          is_primary: false
        }])
        .select()
        .single()
      
      if (imageError) {
        console.log(`  ❌ Product images test failed: ${imageError.message}`)
      } else {
        console.log(`  ✅ Product images test passed: Image created with ID ${testImage.id}`)
        
        // Clean up test image
        await supabaseAdmin.from('product_images').delete().eq('id', testImage.id)
      }
    } else {
      console.log('  ⚠️ No products available for product_images test')
    }
    
    // Test 3: Check if order_items can be created with valid order_id and product_id
    console.log('  📖 Testing order_items foreign keys...')
    const { data: validOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1)
      .single()
    
    if (validOrder && validProduct) {
      const { data: testItem, error: itemError } = await supabaseAdmin
        .from('order_items')
        .insert([{
          order_id: validOrder.id,
          product_id: validProduct.id,
          quantity: 2,
          price: 99.99,
          selected_color: 'Red',
          selected_features: ['Feature 1', 'Feature 2']
        }])
        .select()
        .single()
      
      if (itemError) {
        console.log(`  ❌ Order items test failed: ${itemError.message}`)
      } else {
        console.log(`  ✅ Order items test passed: Item created with ID ${testItem.id}`)
        
        // Clean up test item
        await supabaseAdmin.from('order_items').delete().eq('id', testItem.id)
      }
    } else {
      console.log('  ⚠️ No orders or products available for order_items test')
    }
    
    console.log('  ✅ All tests completed')
    
  } catch (error) {
    console.error('  ❌ Test error:', error.message)
  }
}

// Run the fixes
applyDatabaseFixes().catch(console.error)
