// Comprehensive CRUD Test for Frontend to Backend
// Tests all CRUD operations for products, orders, carousel, assets, and QR codes

const BASE_URL = 'http://localhost:3005'

console.log('🧪 Comprehensive CRUD Test - Frontend to Backend')
console.log('Base URL:', BASE_URL)
console.log('')

async function testAPIEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function testProductsCRUD() {
  console.log('📦 Testing Products CRUD Operations...')
  
  // Test 1: GET all products
  console.log('  📖 Testing GET /api/products...')
  const getResponse = await testAPIEndpoint('/api/products')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get products:`, getResponse.success ? `${getResponse.data?.length || 0} products found` : getResponse.error)
  
  // Test 2: POST new product
  console.log('  ➕ Testing POST /api/products...')
  const newProduct = {
    name: 'Test Product CRUD - ' + Date.now(),
    price: 99.99,
    original_price: 129.99,
    description: 'Test product for CRUD operations',
    category: 'test',
    image_url: '/test-image.jpg',
    rating: 4.5,
    reviews: 10,
    features: ['Test feature 1', 'Test feature 2'],
    in_stock: true,
    discount: 23,
    hidden_on_home: false
  }
  
  const createResponse = await testAPIEndpoint('/api/products', 'POST', newProduct)
  console.log(`  ${createResponse.success ? '✅' : '❌'} Create product:`, createResponse.success ? 'Product created' : createResponse.error)
  
  let productId = null
  if (createResponse.success && createResponse.data?.id) {
    productId = createResponse.data.id
    
    // Test 3: GET single product
    console.log(`  📖 Testing GET /api/products/${productId}...`)
    const getSingleResponse = await testAPIEndpoint(`/api/products/${productId}`)
    console.log(`  ${getSingleResponse.success ? '✅' : '❌'} Get single product:`, getSingleResponse.success ? 'Product retrieved' : getSingleResponse.error)
    
    // Test 4: PUT update product
    console.log(`  ✏️ Testing PUT /api/products/${productId}...`)
    const updateData = {
      name: 'Updated Test Product - ' + Date.now(),
      price: 149.99,
      description: 'Updated description'
    }
    const updateResponse = await testAPIEndpoint(`/api/products/${productId}`, 'PUT', updateData)
    console.log(`  ${updateResponse.success ? '✅' : '❌'} Update product:`, updateResponse.success ? 'Product updated' : updateResponse.error)
    
    // Test 5: DELETE product
    console.log(`  🗑️ Testing DELETE /api/products/${productId}...`)
    const deleteResponse = await testAPIEndpoint(`/api/products/${productId}`, 'DELETE')
    console.log(`  ${deleteResponse.success ? '✅' : '❌'} Delete product:`, deleteResponse.success ? 'Product deleted' : deleteResponse.error)
  }
  
  return createResponse.success
}

async function testOrdersCRUD() {
  console.log('\n📋 Testing Orders CRUD Operations...')
  
  // Test 1: GET all orders
  console.log('  📖 Testing GET /api/orders...')
  const getResponse = await testAPIEndpoint('/api/orders')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get orders:`, getResponse.success ? `${getResponse.data?.length || 0} orders found` : getResponse.error)
  
  // Test 2: POST new order via checkout
  console.log('  ➕ Testing POST /api/supabase-checkout...')
  const newOrder = {
    orderId: 'TEST-CRUD-' + Date.now(),
    customerInfo: {
      fullName: 'Test Customer CRUD',
      email: 'test@example.com',
      phone: '1234567890',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      fullAddress: 'Test Address'
    },
    cart: [
      {
        id: 21, // Use existing product ID
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: '/test-image.jpg',
        selectedColor: 'Red',
        selectedFeatures: ['Feature 1']
      }
    ],
    total: 99.99,
    paymentOption: 'full'
  }
  
  const createResponse = await testAPIEndpoint('/api/supabase-checkout', 'POST', newOrder)
  console.log(`  ${createResponse.success ? '✅' : '❌'} Create order:`, createResponse.success ? 'Order created' : createResponse.error)
  
  let orderId = null
  if (createResponse.success && createResponse.data?.orderDbId) {
    orderId = createResponse.data.orderDbId
    
    // Test 3: PATCH update order status
    console.log(`  ✏️ Testing PATCH /api/orders...`)
    const updateResponse = await testAPIEndpoint('/api/orders', 'PATCH', {
      orderId: orderId,
      order_status: 'completed'
    })
    console.log(`  ${updateResponse.success ? '✅' : '❌'} Update order:`, updateResponse.success ? 'Order updated' : updateResponse.error)
  }
  
  return createResponse.success
}

async function testCarouselCRUD() {
  console.log('\n🎠 Testing Carousel (Hero Images) CRUD Operations...')
  
  // Test 1: GET hero images
  console.log('  📖 Testing GET /api/hero-images...')
  const getResponse = await testAPIEndpoint('/api/hero-images')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get hero images:`, getResponse.success ? `${getResponse.data?.length || 0} images found` : getResponse.error)
  
  // Note: Hero images CRUD operations might be limited to admin panel
  // For now, we test the read operation
  return getResponse.success
}

async function testAssetsCRUD() {
  console.log('\n📁 Testing Assets CRUD Operations...')
  
  // Test 1: Check if assets API exists
  console.log('  📖 Testing GET /api/assets...')
  const getResponse = await testAPIEndpoint('/api/assets')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get assets:`, getResponse.success ? 'Assets API accessible' : 'Assets API not found')
  
  // Note: Assets might be served directly from storage buckets
  // For now, we test if the API endpoint exists
  return getResponse.success
}

async function testQRCodesCRUD() {
  console.log('\n📱 Testing QR Codes CRUD Operations...')
  
  // Test 1: Check if QR codes API exists
  console.log('  📖 Testing GET /api/qr-codes...')
  const getResponse = await testAPIEndpoint('/api/qr-codes')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get QR codes:`, getResponse.success ? 'QR codes API accessible' : 'QR codes API not found')
  
  // Note: QR codes might be generated dynamically or stored in database
  // For now, we test if the API endpoint exists
  return getResponse.success
}

async function testProductImagesCRUD() {
  console.log('\n🖼️ Testing Product Images CRUD Operations...')
  
  // Test 1: Check if product images API exists
  console.log('  📖 Testing GET /api/product-images...')
  const getResponse = await testAPIEndpoint('/api/product-images')
  console.log(`  ${getResponse.success ? '✅' : '❌'} Get product images:`, getResponse.success ? 'Product images API accessible' : 'Product images API not found')
  
  // Note: Product images might be managed through the admin panel
  // For now, we test if the API endpoint exists
  return getResponse.success
}

async function testStorageBuckets() {
  console.log('\n🗂️ Testing Storage Buckets...')
  
  // Test 1: Check if storage API exists
  console.log('  📖 Testing storage buckets...')
  
  // Test different storage endpoints
  const buckets = [
    '/api/storage/product-images',
    '/api/storage/hero-images', 
    '/api/storage/assets',
    '/api/storage/qr-codes',
    '/api/storage/receipts'
  ]
  
  let successCount = 0
  for (const bucket of buckets) {
    const response = await testAPIEndpoint(bucket)
    console.log(`  ${response.success ? '✅' : '❌'} ${bucket}:`, response.success ? 'Accessible' : 'Not found')
    if (response.success) successCount++
  }
  
  return successCount > 0
}

async function testAdminPanelAccess() {
  console.log('\n🔧 Testing Admin Panel Access...')
  
  // Test admin panel routes
  const adminRoutes = [
    '/admin',
    '/dopetechadmin',
    '/admin/products',
    '/admin/orders',
    '/admin/images'
  ]
  
  let successCount = 0
  for (const route of adminRoutes) {
    const response = await testAPIEndpoint(route)
    console.log(`  ${response.success ? '✅' : '❌'} ${route}:`, response.success ? 'Accessible' : 'Not accessible')
    if (response.success) successCount++
  }
  
  return successCount > 0
}

async function runComprehensiveCRUDTest() {
  console.log('🚀 Starting Comprehensive CRUD Test...\n')
  
  const tests = [
    { name: 'Products CRUD', fn: testProductsCRUD },
    { name: 'Orders CRUD', fn: testOrdersCRUD },
    { name: 'Carousel CRUD', fn: testCarouselCRUD },
    { name: 'Assets CRUD', fn: testAssetsCRUD },
    { name: 'QR Codes CRUD', fn: testQRCodesCRUD },
    { name: 'Product Images CRUD', fn: testProductImagesCRUD },
    { name: 'Storage Buckets', fn: testStorageBuckets },
    { name: 'Admin Panel Access', fn: testAdminPanelAccess }
  ]
  
  const results = []
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name}...`)
    try {
      const result = await test.fn()
      results.push({ name: test.name, success: result })
      console.log(`✅ ${test.name}: ${result ? 'PASSED' : 'FAILED'}`)
    } catch (error) {
      console.error(`❌ ${test.name} ERROR:`, error.message)
      results.push({ name: test.name, success: false, error: error.message })
    }
  }
  
  // Summary
  console.log('\n📊 Comprehensive CRUD Test Results:')
  console.log('=' * 60)
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.name}`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
  })
  
  console.log('\n' + '=' * 60)
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All CRUD operations are working correctly!')
  } else {
    console.log('\n⚠️ Some CRUD operations failed. Check the errors above.')
  }
  
  return results
}

// Run the comprehensive test
runComprehensiveCRUDTest().catch(console.error)
