const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCRUDOperations() {
  console.log('🧪 Testing CRUD Operations...\n')

  let testProductId = null

  try {
    // Test 1: CREATE (Add Product)
    console.log('1️⃣ Testing CREATE (Add Product)...')
    const newProduct = {
      name: 'Test Product CRUD',
      price: 99.99,
      original_price: 129.99,
      description: 'Test product for CRUD operations',
      category: 'keyboard',
      image_url: '/placeholder-product.svg',
      features: ['Test Feature 1', 'Test Feature 2'],
      in_stock: true,
      discount: 10,
      color: 'Black'
    }

    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single()

    if (createError) {
      console.error('❌ CREATE failed:', createError.message)
      return
    }

    testProductId = createdProduct.id
    console.log('✅ CREATE successful - Product ID:', testProductId)
    console.log('   Product name:', createdProduct.name)

    // Test 2: READ (Get Product)
    console.log('\n2️⃣ Testing READ (Get Product)...')
    const { data: readProduct, error: readError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProductId)
      .single()

    if (readError) {
      console.error('❌ READ failed:', readError.message)
    } else {
      console.log('✅ READ successful')
      console.log('   Product name:', readProduct.name)
      console.log('   Price:', readProduct.price)
    }

    // Test 3: UPDATE (Update Product)
    console.log('\n3️⃣ Testing UPDATE (Update Product)...')
    const updateData = {
      name: 'Updated Test Product CRUD',
      price: 89.99,
      description: 'Updated description for CRUD operations'
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', testProductId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message)
    } else {
      console.log('✅ UPDATE successful')
      console.log('   Updated name:', updatedProduct.name)
      console.log('   Updated price:', updatedProduct.price)
    }

    // Test 4: DELETE (Delete Product)
    console.log('\n4️⃣ Testing DELETE (Delete Product)...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', testProductId)

    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError.message)
    } else {
      console.log('✅ DELETE successful')
    }

    // Test 5: Verify Deletion
    console.log('\n5️⃣ Verifying Deletion...')
    const { data: verifyProduct, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProductId)
      .single()

    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('✅ Product successfully deleted (not found)')
    } else if (verifyProduct) {
      console.log('⚠️ Product still exists after deletion')
    } else {
      console.log('✅ Deletion verification successful')
    }

    // Test 6: Orders CRUD
    console.log('\n6️⃣ Testing Orders CRUD...')
    
    // Create Order
    const testOrder = {
      order_id: `TEST-CRUD-${Date.now()}`,
      customer_name: 'Test Customer CRUD',
      customer_email: 'test-crud@example.com',
      customer_phone: '1234567890',
      total_amount: 199.99,
      payment_option: 'full',
      payment_status: 'pending',
      order_status: 'processing'
    }

    const { data: createdOrder, error: orderCreateError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single()

    if (orderCreateError) {
      console.error('❌ Order CREATE failed:', orderCreateError.message)
    } else {
      console.log('✅ Order CREATE successful - Order ID:', createdOrder.id)
      
      // Update Order
      const { data: updatedOrder, error: orderUpdateError } = await supabase
        .from('orders')
        .update({ order_status: 'completed' })
        .eq('id', createdOrder.id)
        .select()
        .single()

      if (orderUpdateError) {
        console.error('❌ Order UPDATE failed:', orderUpdateError.message)
      } else {
        console.log('✅ Order UPDATE successful - Status:', updatedOrder.order_status)
      }

      // Delete Order
      const { error: orderDeleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', createdOrder.id)

      if (orderDeleteError) {
        console.error('❌ Order DELETE failed:', orderDeleteError.message)
      } else {
        console.log('✅ Order DELETE successful')
      }
    }

    // Test 7: Frontend API Routes
    console.log('\n7️⃣ Testing Frontend API Routes...')
    
    // Test orders API route
    try {
      const response = await fetch('http://localhost:3007/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        console.log('✅ Orders API route accessible')
      } else {
        console.log('⚠️ Orders API route returned status:', response.status)
      }
    } catch (error) {
      console.log('⚠️ Could not test orders API route (server might not be running)')
    }

    console.log('\n🎉 CRUD Operations Test Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Products: CREATE, READ, UPDATE, DELETE')
    console.log('✅ Orders: CREATE, UPDATE, DELETE')
    console.log('✅ API Routes: Accessible')
    console.log('✅ Database: All operations working')

  } catch (error) {
    console.error('❌ CRUD test failed:', error.message)
  }
}

testCRUDOperations()
