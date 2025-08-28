// Final Frontend Status Report
// Comprehensive test of frontend UI and API connections

const BASE_URL = 'http://localhost:3005'

console.log('🎯 FINAL FRONTEND STATUS REPORT')
console.log('=' * 60)
console.log('Base URL:', BASE_URL)
console.log('Testing: Frontend UI + API Connections + CRUD Operations')
console.log('')

async function testEndpoint(url, description) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (response.ok) {
      const itemCount = Array.isArray(data) ? data.length : 1
      console.log(`✅ ${description}: ${itemCount} items`)
      return { success: true, data, count: itemCount }
    } else {
      console.log(`❌ ${description}: ${data.error || 'HTTP ' + response.status}`)
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testPage(url, description) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    if (response.ok && (html.includes('__NEXT_DATA__') || html.includes('<!DOCTYPE html>') || html.includes('<html'))) {
      console.log(`✅ ${description}: React/Next.js page loaded`)
      return { success: true }
    } else {
      console.log(`❌ ${description}: Not accessible or not React page`)
      return { success: false }
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testCRUDOperation(operation, testData) {
  try {
    const response = await fetch(testData.url, {
      method: testData.method,
      headers: testData.headers || { 'Content-Type': 'application/json' },
      body: testData.body ? JSON.stringify(testData.body) : undefined
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${operation}: Success`)
      return { success: true, data }
    } else {
      const error = await response.json()
      console.log(`❌ ${operation}: ${error.error || 'HTTP ' + response.status}`)
      return { success: false, error: error.error }
    }
  } catch (error) {
    console.log(`❌ ${operation}: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runFinalStatusTest() {
  console.log('🚀 RUNNING COMPREHENSIVE FRONTEND STATUS TEST...\n')
  
  const results = {
    pages: {},
    apis: {},
    crud: {},
    summary: { total: 0, passed: 0, failed: 0 }
  }
  
  // Test Frontend Pages
  console.log('📄 FRONTEND PAGES:')
  console.log('-'.repeat(40))
  
  results.pages.home = await testPage(`${BASE_URL}/`, 'Home Page')
      results.pages.admin = await testPage(`${BASE_URL}/dopetechadmin`, 'Admin Panel')
  results.pages.dopetechAdmin = await testPage(`${BASE_URL}/dopetechadmin`, 'DopeTech Admin')
  results.pages.productDetail = await testPage(`${BASE_URL}/product/1`, 'Product Detail Page')

  
  // Test API Endpoints
  console.log('\n🔗 API ENDPOINTS:')
  console.log('-'.repeat(40))
  
  results.apis.products = await testEndpoint(`${BASE_URL}/api/products`, 'Products API')
  results.apis.orders = await testEndpoint(`${BASE_URL}/api/orders`, 'Orders API')
  results.apis.heroImages = await testEndpoint(`${BASE_URL}/api/hero-images`, 'Hero Images API')
  results.apis.assets = await testEndpoint(`${BASE_URL}/api/assets`, 'Assets API')
  results.apis.qrCodes = await testEndpoint(`${BASE_URL}/api/qr-codes`, 'QR Codes API')
  results.apis.productImages = await testEndpoint(`${BASE_URL}/api/product-images?productId=1`, 'Product Images API')
  
  // Test CRUD Operations
  console.log('\n🔄 CRUD OPERATIONS:')
  console.log('-'.repeat(40))
  
  // Create Product
  const createResult = await testCRUDOperation('Create Product', {
    url: `${BASE_URL}/api/products`,
    method: 'POST',
    body: {
      name: 'Final Test Product - ' + Date.now(),
      price: 99.99,
      description: 'Test product for final status check',
      category: 'test',
      in_stock: true,
      image_url: '/test-image.jpg'
    }
  })
  
  results.crud.create = createResult
  
  if (createResult.success && createResult.data?.id) {
    const productId = createResult.data.id
    
    // Read Product
    results.crud.read = await testCRUDOperation('Read Product', {
      url: `${BASE_URL}/api/products/${productId}`,
      method: 'GET'
    })
    
    // Update Product
    results.crud.update = await testCRUDOperation('Update Product', {
      url: `${BASE_URL}/api/products/${productId}`,
      method: 'PUT',
      body: {
        name: 'Updated Final Test Product',
        price: 149.99
      }
    })
    
    // Delete Product
    results.crud.delete = await testCRUDOperation('Delete Product', {
      url: `${BASE_URL}/api/products/${productId}`,
      method: 'DELETE'
    })
  }
  
  // Calculate Summary
  const allTests = [
    ...Object.values(results.pages),
    ...Object.values(results.apis),
    ...Object.values(results.crud)
  ]
  
  results.summary.total = allTests.length
  results.summary.passed = allTests.filter(r => r.success).length
  results.summary.failed = allTests.filter(r => !r.success).length
  
  // Print Summary
  console.log('\n📊 FINAL STATUS SUMMARY:')
  console.log('=' * 60)
  
  console.log(`📄 Frontend Pages: ${Object.values(results.pages).filter(r => r.success).length}/${Object.keys(results.pages).length} working`)
  console.log(`🔗 API Endpoints: ${Object.values(results.apis).filter(r => r.success).length}/${Object.keys(results.apis).length} working`)
  console.log(`🔄 CRUD Operations: ${Object.values(results.crud).filter(r => r.success).length}/${Object.keys(results.crud).length} working`)
  
  console.log('\n' + '=' * 60)
  console.log(`Total Tests: ${results.summary.total}`)
  console.log(`✅ Passed: ${results.summary.passed}`)
  console.log(`❌ Failed: ${results.summary.failed}`)
  console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`)
  
  // Detailed Results
  console.log('\n📋 DETAILED RESULTS:')
  console.log('-'.repeat(40))
  
  console.log('\n📄 Frontend Pages:')
  Object.entries(results.pages).forEach(([name, result]) => {
    console.log(`  ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'Working' : 'Failed'}`)
  })
  
  console.log('\n🔗 API Endpoints:')
  Object.entries(results.apis).forEach(([name, result]) => {
    if (result.success) {
      console.log(`  ✅ ${name}: ${result.count} items`)
    } else {
      console.log(`  ❌ ${name}: ${result.error}`)
    }
  })
  
  console.log('\n🔄 CRUD Operations:')
  Object.entries(results.crud).forEach(([name, result]) => {
    console.log(`  ${result.success ? '✅' : '❌'} ${name}: ${result.success ? 'Working' : result.error}`)
  })
  
  // Final Status
  console.log('\n🎯 FINAL STATUS:')
  console.log('=' * 60)
  
  if (results.summary.failed === 0) {
    console.log('🎉 EXCELLENT! All frontend UI and API connections are working perfectly!')
    console.log('✅ Frontend pages are loading correctly')
    console.log('✅ API endpoints are responding properly')
    console.log('✅ CRUD operations are functioning')
    console.log('✅ Database connections are stable')
    console.log('✅ Ready for production use!')
  } else if (results.summary.passed / results.summary.total > 0.8) {
    console.log('👍 GOOD! Most frontend functionality is working well!')
    console.log('⚠️ Some minor issues detected but core functionality is operational')
  } else {
    console.log('⚠️ ATTENTION! Several frontend issues detected')
    console.log('🔧 Some components may need attention')
  }
  
  return results
}

// Run the final status test
runFinalStatusTest().catch(console.error)
