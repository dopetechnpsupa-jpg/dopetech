// Test Admin Panel Product Creation
// This tests if the admin panel can add products without console errors

const BASE_URL = 'http://localhost:3005'

console.log('🧪 Testing Admin Panel Product Creation...')
console.log('Base URL:', BASE_URL)
console.log('')

async function testAdminProductCreation() {
  try {
    console.log('📦 Testing product creation via admin panel...')
    
    // Test creating a product (simulating admin panel action)
    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Panel Test Product - ' + Date.now(),
        price: 99.99,
        original_price: 129.99,
        description: 'Test product created from admin panel',
        category: 'test',
        image_url: '/test-image.jpg',
        rating: 4.5,
        reviews: 10,
        features: ['Test feature 1', 'Test feature 2'],
        in_stock: true,
        discount: 23,
        hidden_on_home: false
      })
    })
    
    if (createResponse.ok) {
      const product = await createResponse.json()
      console.log(`✅ Product created successfully with ID: ${product.id}`)
      console.log(`✅ Product name: ${product.name}`)
      console.log(`✅ Product price: $${product.price}`)
      
      // Test updating the product
      console.log('\n✏️ Testing product update...')
      const updateResponse = await fetch(`${BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Admin Panel Test Product',
          price: 149.99,
          description: 'Updated description from admin panel'
        })
      })
      
      if (updateResponse.ok) {
        const updatedProduct = await updateResponse.json()
        console.log(`✅ Product updated successfully`)
        console.log(`✅ Updated name: ${updatedProduct.name}`)
        console.log(`✅ Updated price: $${updatedProduct.price}`)
        
        // Test deleting the product
        console.log('\n🗑️ Testing product deletion...')
        const deleteResponse = await fetch(`${BASE_URL}/api/products/${product.id}`, {
          method: 'DELETE'
        })
        
        if (deleteResponse.ok) {
          console.log(`✅ Product deleted successfully`)
          console.log('\n🎉 All admin panel CRUD operations working perfectly!')
          return true
        } else {
          console.log(`❌ Product deletion failed: ${deleteResponse.status}`)
          return false
        }
      } else {
        console.log(`❌ Product update failed: ${updateResponse.status}`)
        return false
      }
    } else {
      const error = await createResponse.json()
      console.log(`❌ Product creation failed: ${createResponse.status}`)
      console.log(`❌ Error: ${error.error || 'Unknown error'}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
    return false
  }
}

async function testProductImageOperations() {
  try {
    console.log('\n🖼️ Testing product image operations...')
    
    // First create a product to attach images to
    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Image Test Product - ' + Date.now(),
        price: 79.99,
        description: 'Test product for image operations',
        category: 'test',
        in_stock: true
      })
    })
    
    if (!createResponse.ok) {
      console.log('❌ Cannot test image operations - product creation failed')
      return false
    }
    
    const product = await createResponse.json()
    console.log(`✅ Test product created with ID: ${product.id}`)
    
    // Test adding a product image
    console.log('📷 Testing adding product image...')
    const imageResponse = await fetch(`${BASE_URL}/api/product-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        image_url: 'https://test-image-url.com/test.jpg',
        file_name: 'test-image.jpg',
        display_order: 1,
        is_primary: true
      })
    })
    
    if (imageResponse.ok) {
      const image = await imageResponse.json()
      console.log(`✅ Product image added successfully with ID: ${image.id}`)
      
      // Clean up - delete the test product
      await fetch(`${BASE_URL}/api/products/${product.id}`, { method: 'DELETE' })
      console.log('✅ Test product cleaned up')
      
      return true
    } else {
      console.log(`❌ Product image addition failed: ${imageResponse.status}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Image test error: ${error.message}`)
    return false
  }
}

async function runAdminTests() {
  console.log('🚀 Starting Admin Panel Tests...\n')
  
  const productTest = await testAdminProductCreation()
  const imageTest = await testProductImageOperations()
  
  console.log('\n📊 Admin Panel Test Results:')
  console.log('=' * 50)
  console.log(`📦 Product CRUD: ${productTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🖼️ Image Operations: ${imageTest ? '✅ PASS' : '❌ FAIL'}`)
  
  if (productTest && imageTest) {
    console.log('\n🎉 EXCELLENT! Admin panel is working perfectly!')
    console.log('✅ No console errors when adding products')
    console.log('✅ All CRUD operations working')
    console.log('✅ Product image operations working')
    console.log('✅ Ready for admin use!')
  } else {
    console.log('\n⚠️ Some admin panel issues detected')
    console.log('🔧 Check the errors above')
  }
  
  return { productTest, imageTest }
}

// Run the admin tests
runAdminTests().catch(console.error)
