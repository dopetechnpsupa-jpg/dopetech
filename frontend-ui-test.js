// Frontend UI Test - Testing actual frontend pages and their API connections
// This tests the real frontend UI, not just API endpoints

const BASE_URL = 'http://localhost:3005'

console.log('🧪 Frontend UI Test - Testing Frontend Pages and API Connections')
console.log('Base URL:', BASE_URL)
console.log('')

async function testFrontendPage(url, description) {
  try {
    console.log(`📖 Testing ${description} (${url})...`)
    
    const response = await fetch(url)
    const html = await response.text()
    
    if (!response.ok) {
      console.log(`  ❌ ${description}: HTTP ${response.status}`)
      return false
    }
    
    // Check if it's a valid HTML page
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      console.log(`  ❌ ${description}: Not a valid HTML page`)
      return false
    }
    
    // Check for common frontend indicators
    const hasReact = html.includes('__NEXT_DATA__') || html.includes('react')
    const hasContent = html.length > 1000 // Basic content check
    
    if (hasReact && hasContent) {
      console.log(`  ✅ ${description}: Valid React/Next.js page (${html.length} chars)`)
      return true
    } else {
      console.log(`  ⚠️ ${description}: Page loaded but may be empty or error page`)
      return false
    }
    
  } catch (error) {
    console.log(`  ❌ ${description}: ${error.message}`)
    return false
  }
}

async function testAPIFromFrontend(apiUrl, description) {
  try {
    console.log(`🔗 Testing ${description} (${apiUrl})...`)
    
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    if (!response.ok) {
      console.log(`  ❌ ${description}: HTTP ${response.status} - ${data.error || 'Unknown error'}`)
      return false
    }
    
    console.log(`  ✅ ${description}: Success (${Array.isArray(data) ? data.length : 1} items)`)
    return true
    
  } catch (error) {
    console.log(`  ❌ ${description}: ${error.message}`)
    return false
  }
}

async function testProductPageWithAPI() {
  console.log('\n📦 Testing Product Page with API Connection...')
  
  // Test the products API
  const apiSuccess = await testAPIFromFrontend(`${BASE_URL}/api/products`, 'Products API')
  
  if (!apiSuccess) {
    console.log('  ❌ Cannot test product page - API not working')
    return false
  }
  
  // Test the product detail page
  const pageSuccess = await testFrontendPage(`${BASE_URL}/product/1`, 'Product Detail Page')
  
  return apiSuccess && pageSuccess
}

async function testAdminPanelWithAPI() {
  console.log('\n🔧 Testing Admin Panel with API Connection...')
  
  // Test admin panel page
  const adminPage = await testFrontendPage(`${BASE_URL}/dopetechadmin`, 'Admin Panel')
  const dopetechAdminPage = await testFrontendPage(`${BASE_URL}/dopetechadmin`, 'DopeTech Admin Panel')
  
  // Test APIs that admin panel would use
  const productsAPI = await testAPIFromFrontend(`${BASE_URL}/api/products`, 'Products API for Admin')
  const ordersAPI = await testAPIFromFrontend(`${BASE_URL}/api/orders`, 'Orders API for Admin')
  const heroImagesAPI = await testAPIFromFrontend(`${BASE_URL}/api/hero-images`, 'Hero Images API for Admin')
  
  return adminPage || dopetechAdminPage
}

async function testHomePageWithCarousel() {
  console.log('\n🏠 Testing Home Page with Carousel...')
  
  // Test home page
  const homePage = await testFrontendPage(`${BASE_URL}/`, 'Home Page')
  
  // Test carousel/hero images API
  const carouselAPI = await testAPIFromFrontend(`${BASE_URL}/api/hero-images`, 'Carousel/Hero Images API')
  
  return homePage && carouselAPI
}

async function testOrderFlow() {
  console.log('\n🛒 Testing Order Flow...')
  
  // Test checkout API
  const checkoutAPI = await testAPIFromFrontend(`${BASE_URL}/api/supabase-checkout`, 'Checkout API (GET)')
  
  // Test orders API
  const ordersAPI = await testAPIFromFrontend(`${BASE_URL}/api/orders`, 'Orders API')
  
  return checkoutAPI && ordersAPI
}

async function testAssetsAndStorage() {
  console.log('\n📁 Testing Assets and Storage...')
  
  // Test assets API
  const assetsAPI = await testAPIFromFrontend(`${BASE_URL}/api/assets`, 'Assets API')
  
  // Test QR codes API
  const qrCodesAPI = await testAPIFromFrontend(`${BASE_URL}/api/qr-codes`, 'QR Codes API')
  
  // Test product images API
  const productImagesAPI = await testAPIFromFrontend(`${BASE_URL}/api/product-images?productId=1`, 'Product Images API')
  
  return assetsAPI && qrCodesAPI && productImagesAPI
}



async function testCRUDOperationsFromFrontend() {
  console.log('\n🔄 Testing CRUD Operations from Frontend...')
  
  // Test creating a product via API
  console.log('  ➕ Testing Product Creation...')
  try {
    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Frontend Test Product - ' + Date.now(),
        price: 99.99,
        description: 'Test product from frontend',
        category: 'test',
        in_stock: true,
        image_url: '/test-image.jpg'
      })
    })
    
    if (createResponse.ok) {
      const product = await createResponse.json()
      console.log(`  ✅ Product created with ID: ${product.id}`)
      
      // Test updating the product
      console.log('  ✏️ Testing Product Update...')
      const updateResponse = await fetch(`${BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Frontend Test Product',
          price: 149.99
        })
      })
      
      if (updateResponse.ok) {
        console.log('  ✅ Product updated successfully')
        
        // Test deleting the product
        console.log('  🗑️ Testing Product Deletion...')
        const deleteResponse = await fetch(`${BASE_URL}/api/products/${product.id}`, {
          method: 'DELETE'
        })
        
        if (deleteResponse.ok) {
          console.log('  ✅ Product deleted successfully')
          return true
        } else {
          console.log('  ❌ Product deletion failed')
          return false
        }
      } else {
        console.log('  ❌ Product update failed')
        return false
      }
    } else {
      console.log('  ❌ Product creation failed')
      return false
    }
  } catch (error) {
    console.log(`  ❌ CRUD test error: ${error.message}`)
    return false
  }
}

async function runFrontendUITest() {
  console.log('🚀 Starting Frontend UI Test...\n')
  
  const tests = [
    { name: 'Home Page with Carousel', fn: testHomePageWithCarousel },
    { name: 'Product Page with API', fn: testProductPageWithAPI },
    { name: 'Admin Panel with API', fn: testAdminPanelWithAPI },
    { name: 'Order Flow', fn: testOrderFlow },
    { name: 'Assets and Storage', fn: testAssetsAndStorage },

    { name: 'CRUD Operations', fn: testCRUDOperationsFromFrontend }
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
  console.log('\n📊 Frontend UI Test Results:')
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
    console.log('\n🎉 All frontend UI tests passed! Frontend is working correctly.')
  } else {
    console.log('\n⚠️ Some frontend UI tests failed. Check the errors above.')
  }
  
  return results
}

// Run the frontend UI test
runFrontendUITest().catch(console.error)
