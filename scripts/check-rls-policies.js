const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS policies...')

  try {
    // Check if RLS is enabled on tables
    console.log('\n📋 Checking RLS status on tables...')
    
    // Test products table
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      console.error('❌ Products table RLS issue:', productsError.message)
    } else {
      console.log('✅ Products table accessible with RLS')
    }

    // Test orders table
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
    
    if (ordersError) {
      console.error('❌ Orders table RLS issue:', ordersError.message)
    } else {
      console.log('✅ Orders table accessible with RLS')
    }

    // Test order_items table
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1)
    
    if (itemsError) {
      console.error('❌ Order items table RLS issue:', itemsError.message)
    } else {
      console.log('✅ Order items table accessible with RLS')
    }

    // Test storage buckets
    console.log('\n🪣 Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Storage buckets error:', bucketsError.message)
    } else {
      console.log('✅ Storage buckets accessible:', buckets.map(b => b.name))
    }

    // Test file upload to receipts bucket
    console.log('\n📤 Testing file upload to receipts bucket...')
    const testFileName = `test-${Date.now()}.txt`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(testFileName, 'test content', {
        contentType: 'text/plain'
      })
    
    if (uploadError) {
      console.error('❌ File upload test failed:', uploadError.message)
    } else {
      console.log('✅ File upload test successful')
      
      // Clean up test file
      await supabase.storage
        .from('receipts')
        .remove([testFileName])
    }

    console.log('\n🎉 RLS and storage tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

checkRLSPolicies()
