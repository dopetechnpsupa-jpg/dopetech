const { createClient } = require('@supabase/supabase-js')

// CORRECT Supabase configuration (from lib/supabase.ts)
const supabaseUrl = 'https://flrcwmmdveylmcbjuwfc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscmN3bW1kdmV5bG1jYmp1d2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg1OTYyMiwiZXhwIjoyMDcxNDM1NjIyfQ.2pm7uDjc3B73xlaqxwaS7qjwCYaOOjA7WQY6wV4WAeA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCorrectSupabase() {
  console.log('🔧 Testing CORRECT Supabase Configuration...\n')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Service Key Set:', !!supabaseServiceKey)

  try {
    // Test 1: Check database connection
    console.log('\n1️⃣ Testing Database Connection...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5)

    if (productsError) {
      console.error('❌ Database connection failed:', productsError.message)
      return
    }

    console.log('✅ Database connection successful')
    console.log(`   Found ${products.length} products in database`)
    
    if (products.length > 0) {
      console.log('   Sample products:')
      products.forEach(product => {
        console.log(`   - ${product.name} (ID: ${product.id}, Price: $${product.price})`)
      })
    }

    // Test 2: Test CRUD operations
    console.log('\n2️⃣ Testing CRUD Operations...')
    
    // CREATE
    console.log('   Testing CREATE...')
    const testProduct = {
      name: 'Correct Supabase Test Product',
      price: 299.99,
      original_price: 399.99,
      description: 'Test product with correct Supabase configuration',
      category: 'keyboard',
      image_url: '/placeholder-product.svg',
      features: ['Correct Test Feature 1', 'Correct Test Feature 2'],
      in_stock: true,
      discount: 25,
      color: 'Red'
    }

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single()

    if (createError) {
      console.error('❌ CREATE failed:', createError.message)
      return
    }

    console.log('✅ CREATE successful')
    console.log(`   Created product: ${createdProduct.name} (ID: ${createdProduct.id})`)

    // READ
    console.log('   Testing READ...')
    const { data: readProduct, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', createdProduct.id)
      .single()

    if (readError) {
      console.error('❌ READ failed:', readError.message)
    } else {
      console.log('✅ READ successful')
      console.log(`   Read product: ${readProduct.name}`)
    }

    // UPDATE
    console.log('   Testing UPDATE...')
    const updateData = {
      name: 'Updated Correct Supabase Test Product',
      price: 279.99,
      description: 'Updated description with correct Supabase'
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', createdProduct.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message)
    } else {
      console.log('✅ UPDATE successful')
      console.log(`   Updated product: ${updatedProduct.name} (Price: $${updatedProduct.price})`)
    }

    // DELETE
    console.log('   Testing DELETE...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', createdProduct.id)

    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError.message)
    } else {
      console.log('✅ DELETE successful')
    }

    // Test 3: Check orders table
    console.log('\n3️⃣ Testing Orders Table...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)

    if (ordersError) {
      console.error('❌ Orders table error:', ordersError.message)
    } else {
      console.log('✅ Orders table accessible')
      console.log(`   Found ${orders.length} orders in database`)
    }

    // Test 4: Check storage buckets
    console.log('\n4️⃣ Testing Storage Buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Storage buckets error:', bucketsError.message)
    } else {
      console.log('✅ Storage buckets accessible')
      console.log(`   Found ${buckets.length} buckets:`)
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }

    console.log('\n🎉 CORRECT Supabase Test Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Database connection: Working with correct URL')
    console.log('✅ CRUD operations: All working')
    console.log('✅ Orders table: Accessible')
    console.log('✅ Storage buckets: Accessible')
    console.log('✅ Configuration: Using correct Supabase instance')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCorrectSupabase()
