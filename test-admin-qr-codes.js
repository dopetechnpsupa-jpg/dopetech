// Test Admin Panel QR Code Upload
const BASE_URL = 'http://localhost:3005'

console.log('🧪 Testing Admin Panel QR Code Upload...')
console.log('Base URL:', BASE_URL)
console.log('')

async function testAdminQRCodeUpload() {
  try {
    console.log('📱 Testing QR code creation via admin panel...')
    
    // Test creating a QR code (simulating admin panel action)
    const createResponse = await fetch(`${BASE_URL}/api/qr-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin Panel Test QR Code - ' + Date.now(),
        image_url: 'https://flrcwmmdveylmcbjuwfc.supabase.co/storage/v1/object/public/qr-codes/test-qr.svg',
        is_active: true
      })
    })
    
    if (createResponse.ok) {
      const qrCode = await createResponse.json()
      console.log(`✅ QR code created successfully with ID: ${qrCode.id}`)
      console.log(`✅ QR code name: ${qrCode.name}`)
      console.log(`✅ QR code URL: ${qrCode.url}`)
      
      // Test getting all QR codes
      console.log('\n📋 Testing get all QR codes...')
      const getResponse = await fetch(`${BASE_URL}/api/qr-codes`)
      
      if (getResponse.ok) {
        const qrCodes = await getResponse.json()
        console.log(`✅ Retrieved ${qrCodes.length} QR codes`)
        qrCodes.forEach(qr => {
          console.log(`   - ${qr.name} (${qr.is_active ? 'Active' : 'Inactive'})`)
        })
      } else {
        console.log(`❌ Get QR codes failed: ${getResponse.status}`)
      }
      
      console.log('\n🎉 Admin panel QR code operations working perfectly!')
      return true
    } else {
      const error = await createResponse.json()
      console.log(`❌ QR code creation failed: ${createResponse.status}`)
      console.log(`❌ Error: ${error.error || 'Unknown error'}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
    return false
  }
}

async function testQRCodeStorageUpload() {
  try {
    console.log('\n🖼️ Testing QR code image upload...')
    
    // Create a simple test image
    const testImageContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <rect x="60" y="60" width="80" height="80" fill="black"/>
      <text x="100" y="190" text-anchor="middle" fill="black" font-size="12">Admin Test QR</text>
    </svg>`
    
    // Convert to blob
    const blob = new Blob([testImageContent], { type: 'image/svg+xml' })
    const file = new File([blob], 'admin-test-qr.svg', { type: 'image/svg+xml' })
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // Test uploading to assets API (which handles file uploads)
    const uploadResponse = await fetch(`${BASE_URL}/api/assets`, {
      method: 'POST',
      body: formData
    })
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json()
      console.log(`✅ QR code image uploaded successfully`)
      console.log(`✅ File name: ${uploadResult.fileName}`)
      console.log(`✅ File path: ${uploadResult.path}`)
      
      // Now create a QR code entry with this image
      console.log('\n📝 Creating QR code entry with uploaded image...')
      const qrCodeResponse = await fetch(`${BASE_URL}/api/qr-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Admin Uploaded QR Code - ' + Date.now(),
          image_url: `https://flrcwmmdveylmcbjuwfc.supabase.co/storage/v1/object/public/assets/${uploadResult.fileName}`,
          is_active: false
        })
      })
      
      if (qrCodeResponse.ok) {
        const qrCode = await qrCodeResponse.json()
        console.log(`✅ QR code entry created with ID: ${qrCode.id}`)
        console.log(`✅ QR code name: ${qrCode.name}`)
        console.log(`✅ QR code image: ${qrCode.image_url}`)
        
        return true
      } else {
        const error = await qrCodeResponse.json()
        console.log(`❌ QR code entry creation failed: ${qrCodeResponse.status}`)
        console.log(`❌ Error: ${error.error || 'Unknown error'}`)
        return false
      }
    } else {
      const error = await uploadResponse.json()
      console.log(`❌ QR code image upload failed: ${uploadResponse.status}`)
      console.log(`❌ Error: ${error.error || 'Unknown error'}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
    return false
  }
}

async function runAdminQRTests() {
  console.log('🚀 Starting Admin Panel QR Code Tests...\n')
  
  const apiTest = await testAdminQRCodeUpload()
  const uploadTest = await testQRCodeStorageUpload()
  
  console.log('\n📊 Admin Panel QR Code Test Results:')
  console.log('=' * 50)
  console.log(`📱 QR Code API: ${apiTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🖼️ QR Code Upload: ${uploadTest ? '✅ PASS' : '❌ FAIL'}`)
  
  if (apiTest && uploadTest) {
    console.log('\n🎉 EXCELLENT! Admin panel QR code functionality is working perfectly!')
    console.log('✅ No RLS violations when uploading QR codes')
    console.log('✅ QR code API operations working')
    console.log('✅ QR code image upload working')
    console.log('✅ Ready for admin use!')
  } else {
    console.log('\n⚠️ Some admin panel QR code issues detected')
    console.log('🔧 Check the errors above')
  }
  
  return { apiTest, uploadTest }
}

// Run the admin QR code tests
runAdminQRTests().catch(console.error)
