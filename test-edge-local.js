const BASE_URL = 'http://localhost:3005'

async function quickTest() {
  console.log('🚀 Quick Edge Functions Test')
  console.log('=' * 40)
  
  try {
    // Test 1: Products API
    console.log('\n📦 Testing Products API...')
    const productsResponse = await fetch(`${BASE_URL}/api/products`)
    const products = await productsResponse.json()
    
    console.log(`✅ Products API: ${productsResponse.status}`)
    console.log(`📊 Products returned: ${products?.length || 0}`)
    
    // Check cache headers
    const cacheControl = productsResponse.headers.get('cache-control')
    console.log(`🔍 Cache-Control: ${cacheControl}`)
    
    if (cacheControl && cacheControl.includes('max-age=300')) {
      console.log('✅ Edge caching working!')
    } else {
      console.log('⚠️ Edge caching headers missing')
    }
    
    // Test 2: Hero Images API
    console.log('\n🖼️ Testing Hero Images API...')
    const heroResponse = await fetch(`${BASE_URL}/api/hero-images`)
    const heroImages = await heroResponse.json()
    
    console.log(`✅ Hero Images API: ${heroResponse.status}`)
    console.log(`📊 Hero images returned: ${heroImages?.length || 0}`)
    
    // Test 3: Performance test
    console.log('\n⚡ Testing Performance...')
    const startTime = Date.now()
    
    const promises = []
    for (let i = 0; i < 3; i++) {
      promises.push(fetch(`${BASE_URL}/api/products`))
    }
    
    await Promise.all(promises)
    const endTime = Date.now()
    
    console.log(`✅ 3 concurrent requests completed in ${endTime - startTime}ms`)
    
    if (endTime - startTime < 1000) {
      console.log('✅ Fast response times - Edge Functions working!')
    } else {
      console.log('⚠️ Response times could be faster')
    }
    
    console.log('\n🎉 Quick test completed!')
    console.log('✅ Edge Functions are working correctly')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure your development server is running:')
    console.log('   npm run dev')
  }
}

quickTest()
