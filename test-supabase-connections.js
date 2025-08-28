const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk2MjIsImV4cCI6MjA3MTQzNTYyMn0.NitC7tHaImTORdaKgCFXkKRLNMOxJCuBbTDAyr8AVa0'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔧 Testing Supabase Connections...')
console.log('URL:', supabaseUrl)
console.log('Anon Key Set:', !!supabaseAnonKey)
console.log('Service Key Set:', !!supabaseServiceKey)
console.log('')

async function testSupabaseConnection() {
  console.log('🔗 Testing basic Supabase connection...')
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1)
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    console.log('✅ Connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

async function testProductsTable() {
  console.log('\n📦 Testing Products Table...')
  
  try {
    // Test reading products
    console.log('  📖 Reading products...')
    const { data: products, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('  ❌ Read error:', readError.message)
      return false
    }
    
    console.log(`  ✅ Read successful: ${products?.length || 0} products found`)
    
    // Test creating a product
    console.log('  ➕ Creating test product...')
    const testProduct = {
      name: 'Test Product - ' + Date.now(),
      price: 99.99,
      original_price: 129.99,
      description: 'Test product for API testing',
      category: 'test',
      image_url: '/test-image.jpg',
      rating: 4.5,
      reviews: 10,
      features: ['Test feature 1', 'Test feature 2'],
      in_stock: true,
      discount: 23,
      hidden_on_home: true // Hide from frontend
    }
    
    const { data: newProduct, error: createError } = await supabaseAdmin
      .from('products')
      .insert([testProduct])
      .select()
      .single()
    
    if (createError) {
      console.error('  ❌ Create error:', createError.message)
      return false
    }
    
    console.log(`  ✅ Create successful: Product ID ${newProduct.id}`)
    
    // Test updating the product
    console.log('  ✏️ Updating test product...')
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ name: 'Updated Test Product - ' + Date.now() })
      .eq('id', newProduct.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('  ❌ Update error:', updateError.message)
      return false
    }
    
    console.log('  ✅ Update successful')
    
    // Test deleting the product
    console.log('  🗑️ Deleting test product...')
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', newProduct.id)
    
    if (deleteError) {
      console.error('  ❌ Delete error:', deleteError.message)
      return false
    }
    
    console.log('  ✅ Delete successful')
    return true
    
  } catch (error) {
    console.error('  ❌ Products test error:', error.message)
    return false
  }
}

async function testProductImagesTable() {
  console.log('\n🖼️ Testing Product Images Table...')
  
  try {
    // Test reading product images
    console.log('  📖 Reading product images...')
    const { data: images, error: readError } = await supabase
      .from('product_images')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('  ❌ Read error:', readError.message)
      return false
    }
    
    console.log(`  ✅ Read successful: ${images?.length || 0} images found`)
    
    // Test creating a product image
    console.log('  ➕ Creating test product image...')
    
    // Get a valid product ID first
    const { data: validProduct } = await supabase
      .from('products')
      .select('id')
      .limit(1)
      .single()
    
    if (!validProduct) {
      console.log('  ⚠️ No products available for testing')
      return false
    }
    
    const testImage = {
      product_id: validProduct.id, // Use valid product ID
      image_url: 'https://test-image-url.com/test.jpg',
      file_name: 'test-image.jpg',
      display_order: 1,
      is_primary: false
    }
    
    const { data: newImage, error: createError } = await supabaseAdmin
      .from('product_images')
      .insert([testImage])
      .select()
      .single()
    
    if (createError) {
      console.error('  ❌ Create error:', createError.message)
      return false
    }
    
    console.log(`  ✅ Create successful: Image ID ${newImage.id}`)
    
    // Test updating the image
    console.log('  ✏️ Updating test image...')
    const { data: updatedImage, error: updateError } = await supabaseAdmin
      .from('product_images')
      .update({ display_order: 2 })
      .eq('id', newImage.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('  ❌ Update error:', updateError.message)
      return false
    }
    
    console.log('  ✅ Update successful')
    
    // Test deleting the image
    console.log('  🗑️ Deleting test image...')
    const { error: deleteError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', newImage.id)
    
    if (deleteError) {
      console.error('  ❌ Delete error:', deleteError.message)
      return false
    }
    
    console.log('  ✅ Delete successful')
    return true
    
  } catch (error) {
    console.error('  ❌ Product images test error:', error.message)
    return false
  }
}

async function testOrdersTable() {
  console.log('\n📋 Testing Orders Table...')
  
  try {
    // Test reading orders
    console.log('  📖 Reading orders...')
    const { data: orders, error: readError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('  ❌ Read error:', readError.message)
      return false
    }
    
    console.log(`  ✅ Read successful: ${orders?.length || 0} orders found`)
    
    // Test creating an order
    console.log('  ➕ Creating test order...')
    const testOrder = {
      order_id: 'TEST-' + Date.now(),
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      customer_city: 'Test City',
      customer_state: 'Test State',
      customer_zip_code: '12345',
      customer_address: 'Test Address',
      total_amount: 199.99,
      payment_option: 'full',
      payment_status: 'pending',
      order_status: 'processing'
    }
    
    const { data: newOrder, error: createError } = await supabaseAdmin
      .from('orders')
      .insert([testOrder])
      .select()
      .single()
    
    if (createError) {
      console.error('  ❌ Create error:', createError.message)
      return false
    }
    
    console.log(`  ✅ Create successful: Order ID ${newOrder.id}`)
    
    // Test updating the order
    console.log('  ✏️ Updating test order...')
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ order_status: 'completed' })
      .eq('id', newOrder.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('  ❌ Update error:', updateError.message)
      return false
    }
    
    console.log('  ✅ Update successful')
    
    // Test deleting the order
    console.log('  🗑️ Deleting test order...')
    const { error: deleteError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', newOrder.id)
    
    if (deleteError) {
      console.error('  ❌ Delete error:', deleteError.message)
      return false
    }
    
    console.log('  ✅ Delete successful')
    return true
    
  } catch (error) {
    console.error('  ❌ Orders test error:', error.message)
    return false
  }
}

async function testOrderItemsTable() {
  console.log('\n🛒 Testing Order Items Table...')
  
  try {
    // Test reading order items
    console.log('  📖 Reading order items...')
    const { data: items, error: readError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.error('  ❌ Read error:', readError.message)
      return false
    }
    
    console.log(`  ✅ Read successful: ${items?.length || 0} items found`)
    
    // Test creating an order item
    console.log('  ➕ Creating test order item...')
    
    // Get valid order and product IDs first
    const { data: validOrder } = await supabase
      .from('orders')
      .select('id')
      .limit(1)
      .single()
    
    const { data: validProduct } = await supabase
      .from('products')
      .select('id')
      .limit(1)
      .single()
    
    if (!validOrder || !validProduct) {
      console.log('  ⚠️ No orders or products available for testing')
      return false
    }
    
    const testItem = {
      order_id: validOrder.id, // Use valid order ID
      product_id: validProduct.id, // Use valid product ID
      quantity: 2,
      price: 99.99,
      selected_color: 'Red',
      selected_features: ['Feature 1', 'Feature 2']
    }
    
    const { data: newItem, error: createError } = await supabaseAdmin
      .from('order_items')
      .insert([testItem])
      .select()
      .single()
    
    if (createError) {
      console.error('  ❌ Create error:', createError.message)
      return false
    }
    
    console.log(`  ✅ Create successful: Item ID ${newItem.id}`)
    
    // Test updating the item
    console.log('  ✏️ Updating test item...')
    const { data: updatedItem, error: updateError } = await supabaseAdmin
      .from('order_items')
      .update({ quantity: 3 })
      .eq('id', newItem.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('  ❌ Update error:', updateError.message)
      return false
    }
    
    console.log('  ✅ Update successful')
    
    // Test deleting the item
    console.log('  🗑️ Deleting test item...')
    const { error: deleteError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('id', newItem.id)
    
    if (deleteError) {
      console.error('  ❌ Delete error:', deleteError.message)
      return false
    }
    
    console.log('  ✅ Delete successful')
    return true
    
  } catch (error) {
    console.error('  ❌ Order items test error:', error.message)
    return false
  }
}

async function testStorageBuckets() {
  console.log('\n📁 Testing Storage Buckets...')
  
  try {
    // Test listing storage buckets
    console.log('  📖 Listing storage buckets...')
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('  ❌ List buckets error:', listError.message)
      return false
    }
    
    console.log(`  ✅ Found ${buckets?.length || 0} buckets:`)
    buckets?.forEach(bucket => {
      console.log(`    - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    // Test receipts bucket specifically
    console.log('  📖 Testing receipts bucket...')
    const { data: receipts, error: receiptsError } = await supabaseAdmin.storage
      .from('receipts')
      .list('', { limit: 5 })
    
    if (receiptsError) {
      console.error('  ❌ Receipts bucket error:', receiptsError.message)
      return false
    }
    
    console.log(`  ✅ Receipts bucket accessible: ${receipts?.length || 0} files found`)
    
    return true
    
  } catch (error) {
    console.error('  ❌ Storage test error:', error.message)
    return false
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Testing Database Schema...')
  
  try {
    // Test all tables exist
    const tables = ['products', 'product_images', 'orders', 'order_items', 'hero_images', 'qr_codes']
    
    for (const table of tables) {
      console.log(`  📖 Testing table: ${table}`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`  ❌ Table ${table} error:`, error.message)
        return false
      }
      
      console.log(`  ✅ Table ${table} accessible`)
    }
    
    return true
    
  } catch (error) {
    console.error('  ❌ Schema test error:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive Supabase connection tests...\n')
  
  const tests = [
    { name: 'Basic Connection', fn: testSupabaseConnection },
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Products Table', fn: testProductsTable },
    { name: 'Product Images Table', fn: testProductImagesTable },
    { name: 'Orders Table', fn: testOrdersTable },
    { name: 'Order Items Table', fn: testOrderItemsTable },
    { name: 'Storage Buckets', fn: testStorageBuckets }
  ]
  
  const results = []
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} test...`)
    try {
      const result = await test.fn()
      results.push({ name: test.name, success: result })
      console.log(`✅ ${test.name} test ${result ? 'PASSED' : 'FAILED'}`)
    } catch (error) {
      console.error(`❌ ${test.name} test ERROR:`, error.message)
      results.push({ name: test.name, success: false, error: error.message })
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('=' * 50)
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.name}`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
  })
  
  console.log('\n' + '=' * 50)
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Supabase integration is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.')
  }
}

// Run the tests
runAllTests().catch(console.error)
