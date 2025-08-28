// Frontend Functionality Test
// This script tests all the frontend API connections and functionality

const BASE_URL = 'http://localhost:3005'

console.log('🧪 Testing Frontend Functionality...')
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
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function testProductsAPI() {
  console.log('📦 Testing Products API...')
  
  // Test getting products
  console.log('  📖 Testing GET /api/products...')
  const productsResponse = await testAPIEndpoint('/api/products')
  console.log(`  ${productsResponse.success ? '✅' : '❌'} Products API:`, productsResponse.success ? `${productsResponse.data?.length || 0} products found` : productsResponse.error)
  
  return productsResponse.success
}

async function testOrdersAPI() {
  console.log('\n📋 Testing Orders API...')
  
  // First get a valid product ID
  console.log('  📖 Getting valid product ID...')
  const productsResponse = await testAPIEndpoint('/api/products')
  if (!productsResponse.success || !productsResponse.data || productsResponse.data.length === 0) {
    console.log('  ❌ No products available for order testing')
    return false
  }
  
  const validProductId = productsResponse.data[0].id
  console.log(`  ✅ Using product ID: ${validProductId}`)
  
  // Test creating an order
  console.log('  ➕ Testing POST /api/supabase-checkout...')
  const testOrder = {
    orderId: 'TEST-' + Date.now(),
    customerInfo: {
      fullName: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      fullAddress: 'Test Address'
    },
    cart: [
      {
        id: validProductId,
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
  
  const orderResponse = await testAPIEndpoint('/api/supabase-checkout', 'POST', testOrder)
  console.log(`  ${orderResponse.success ? '✅' : '❌'} Order creation:`, orderResponse.success ? 'Order created successfully' : orderResponse.error)
  
  if (orderResponse.success && orderResponse.data?.orderDbId) {
    // Test updating order status
    console.log('  ✏️ Testing PATCH /api/orders...')
    const updateResponse = await testAPIEndpoint('/api/orders', 'PATCH', {
      orderId: orderResponse.data.orderDbId,
      order_status: 'completed'
    })
    console.log(`  ${updateResponse.success ? '✅' : '❌'} Order update:`, updateResponse.success ? 'Order updated successfully' : updateResponse.error)
  }
  
  return orderResponse.success
}

async function testAdminPanel() {
  console.log('\n🔧 Testing Admin Panel...')
  
  // Test admin panel access
  console.log('  📖 Testing GET /admin...')
  const adminResponse = await testAPIEndpoint('/admin')
  console.log(`  ${adminResponse.success ? '✅' : '❌'} Admin panel:`, adminResponse.success ? 'Admin panel accessible' : 'Admin panel not accessible')
  
  return adminResponse.success
}

async function testDatabaseTestPage() {
  console.log('\n🗄️ Testing Database Test Page...')
  
  // Test database test page
  console.log('  📖 Testing GET /test-db...')
  const dbTestResponse = await testAPIEndpoint('/test-db')
  console.log(`  ${dbTestResponse.success ? '✅' : '❌'} Database test page:`, dbTestResponse.success ? 'Database test page accessible' : 'Database test page not accessible')
  
  return dbTestResponse.success
}

async function testProductImagesAPI() {
  console.log('\n🖼️ Testing Product Images API...')
  
  // Test hero images API
  console.log('  📖 Testing GET /api/hero-images...')
  const heroImagesResponse = await testAPIEndpoint('/api/hero-images')
  console.log(`  ${heroImagesResponse.success ? '✅' : '❌'} Hero images API:`, heroImagesResponse.success ? 'Hero images API accessible' : heroImagesResponse.error)
  
  return heroImagesResponse.success
}

async function testEmailAPI() {
  console.log('\n📧 Testing Email API...')
  
  // Test email API
  console.log('  📖 Testing POST /api/send-order-emails...')
  const emailResponse = await testAPIEndpoint('/api/send-order-emails', 'POST', {
    orderId: 'TEST-EMAIL',
    customerInfo: {
      fullName: 'Test Customer',
      email: 'test@example.com'
    },
    cart: [],
    total: 0,
    paymentOption: 'full'
  })
  console.log(`  ${emailResponse.success ? '✅' : '❌'} Email API:`, emailResponse.success ? 'Email API accessible' : emailResponse.error)
  
  return emailResponse.success
}

async function testFrontendPages() {
  console.log('\n🌐 Testing Frontend Pages...')
  
  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/admin', name: 'Admin Panel' },
    { path: '/test-db', name: 'Database Test' },
    { path: '/product/1', name: 'Product Detail Page' }
  ]
  
  let successCount = 0
  
  for (const page of pages) {
    console.log(`  📖 Testing ${page.name} (${page.path})...`)
    const response = await testAPIEndpoint(page.path)
    console.log(`  ${response.success ? '✅' : '❌'} ${page.name}:`, response.success ? 'Accessible' : 'Not accessible')
    if (response.success) successCount++
  }
  
  return successCount === pages.length
}

async function testCRUDOperations() {
  console.log('\n🔄 Testing CRUD Operations...')
  
  // Test creating a product via admin panel
  console.log('  ➕ Testing product creation...')
  const createProductResponse = await testAPIEndpoint('/api/products', 'POST', {
    name: 'Test Product - ' + Date.now(),
    price: 99.99,
    description: 'Test product for CRUD testing',
    category: 'test',
    in_stock: true,
    discount: 0,
    image_url: '/test-image.jpg'
  })
  console.log(`  ${createProductResponse.success ? '✅' : '❌'} Product creation:`, createProductResponse.success ? 'Product created' : createProductResponse.error)
  
  if (createProductResponse.success && createProductResponse.data?.id) {
    const productId = createProductResponse.data.id
    
    // Test updating the product
    console.log('  ✏️ Testing product update...')
    const updateProductResponse = await testAPIEndpoint(`/api/products/${productId}`, 'PUT', {
      name: 'Updated Test Product',
      price: 149.99
    })
    console.log(`  ${updateProductResponse.success ? '✅' : '❌'} Product update:`, updateProductResponse.success ? 'Product updated' : updateProductResponse.error)
    
    // Test deleting the product
    console.log('  🗑️ Testing product deletion...')
    const deleteProductResponse = await testAPIEndpoint(`/api/products/${productId}`, 'DELETE')
    console.log(`  ${deleteProductResponse.success ? '✅' : '❌'} Product deletion:`, deleteProductResponse.success ? 'Product deleted' : deleteProductResponse.error)
  }
  
  return createProductResponse.success
}

async function runAllFrontendTests() {
  console.log('🚀 Starting comprehensive frontend functionality tests...\n')
  
  const tests = [
    { name: 'Frontend Pages', fn: testFrontendPages },
    { name: 'Products API', fn: testProductsAPI },
    { name: 'Orders API', fn: testOrdersAPI },
    { name: 'Admin Panel', fn: testAdminPanel },
    { name: 'Database Test Page', fn: testDatabaseTestPage },
    { name: 'Product Images API', fn: testProductImagesAPI },
    { name: 'Email API', fn: testEmailAPI },
    { name: 'CRUD Operations', fn: testCRUDOperations }
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
  console.log('\n📊 Frontend Test Results Summary:')
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
    console.log('\n🎉 All frontend tests passed! Frontend integration is working correctly.')
  } else {
    console.log('\n⚠️ Some frontend tests failed. Please check the errors above.')
  }
  
  return results
}

// Run the tests
runAllFrontendTests().catch(console.error)
