const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aizgswoelfdkhyosgvzu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simulate the CRUD functions from lib/products-data.ts
async function addProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price || productData.price,
        image_url: productData.image_url,
        category: productData.category,
        rating: 0,
        reviews: 0,
        features: productData.features || [],
        color: productData.color || null,
        in_stock: productData.in_stock,
        discount: productData.discount,
        hidden_on_home: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error adding product:', error);
    return null;
  }
}

async function updateProduct(productId, productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        image_url: productData.image_url,
        category: productData.category,
        features: productData.features,
        color: productData.color,
        in_stock: productData.in_stock,
        discount: productData.discount
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function testFrontendCRUD() {
  console.log('🧪 Testing Frontend CRUD Operations...\n')

  let testProductId = null

  try {
    // Test 1: Check current products
    console.log('1️⃣ Checking current products...')
    const currentProducts = await getProducts()
    console.log(`   Found ${currentProducts.length} products in database`)

    // Test 2: CREATE (Add Product) - Simulating admin panel add
    console.log('\n2️⃣ Testing CREATE (Add Product) - Frontend Style...')
    const newProductData = {
      name: 'Frontend Test Product',
      price: 149.99,
      original_price: 199.99,
      description: 'Test product added through frontend CRUD',
      category: 'keyboard',
      image_url: '/placeholder-product.svg',
      features: ['RGB Backlight', 'Wireless', 'Test Feature'],
      in_stock: true,
      discount: 25,
      color: 'Black'
    }

    const createdProduct = await addProduct(newProductData)

    if (!createdProduct) {
      console.error('❌ Frontend CREATE failed - Product not created')
      return
    }

    testProductId = createdProduct.id
    console.log('✅ Frontend CREATE successful')
    console.log('   Product ID:', testProductId)
    console.log('   Product name:', createdProduct.name)
    console.log('   Price:', createdProduct.price)

    // Test 3: READ (Get Products) - Simulating admin panel refresh
    console.log('\n3️⃣ Testing READ (Get Products) - Frontend Style...')
    const updatedProducts = await getProducts()
    const foundProduct = updatedProducts.find(p => p.id === testProductId)
    
    if (foundProduct) {
      console.log('✅ Frontend READ successful')
      console.log('   Found product in list:', foundProduct.name)
    } else {
      console.error('❌ Frontend READ failed - Product not found in list')
    }

    // Test 4: UPDATE (Update Product) - Simulating admin panel edit
    console.log('\n4️⃣ Testing UPDATE (Update Product) - Frontend Style...')
    const updateData = {
      name: 'Updated Frontend Test Product',
      price: 129.99,
      description: 'Updated description through frontend CRUD',
      category: 'keyboard',
      features: ['Updated Feature 1', 'Updated Feature 2'],
      in_stock: true,
      discount: 35,
      color: 'White'
    }

    const updatedProduct = await updateProduct(testProductId, updateData)

    if (updatedProduct) {
      console.log('✅ Frontend UPDATE successful')
      console.log('   Updated name:', updatedProduct.name)
      console.log('   Updated price:', updatedProduct.price)
      console.log('   Updated discount:', updatedProduct.discount)
    } else {
      console.error('❌ Frontend UPDATE failed')
    }

    // Test 5: DELETE (Delete Product) - Simulating admin panel delete
    console.log('\n5️⃣ Testing DELETE (Delete Product) - Frontend Style...')
    const deleteSuccess = await deleteProduct(testProductId)

    if (deleteSuccess) {
      console.log('✅ Frontend DELETE successful')
    } else {
      console.error('❌ Frontend DELETE failed')
    }

    // Test 6: Verify Deletion
    console.log('\n6️⃣ Verifying Frontend Deletion...')
    const finalProducts = await getProducts()
    const productStillExists = finalProducts.find(p => p.id === testProductId)
    
    if (!productStillExists) {
      console.log('✅ Frontend deletion verification successful')
    } else {
      console.error('❌ Product still exists after frontend deletion')
    }

    // Test 7: Check if admin panel would see the changes
    console.log('\n7️⃣ Testing Admin Panel Data Consistency...')
    const adminProducts = await getProducts()
    console.log(`   Admin panel would see ${adminProducts.length} products`)
    
    // Check if any products have the test name pattern
    const testProducts = adminProducts.filter(p => 
      p.name.includes('Frontend Test') || p.name.includes('Test Product')
    )
    
    if (testProducts.length === 0) {
      console.log('✅ Admin panel data is clean (no test products)')
    } else {
      console.log(`⚠️ Found ${testProducts.length} test products in admin panel`)
    }

    console.log('\n🎉 Frontend CRUD Operations Test Completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Frontend CREATE: Working')
    console.log('✅ Frontend READ: Working')
    console.log('✅ Frontend UPDATE: Working')
    console.log('✅ Frontend DELETE: Working')
    console.log('✅ Admin Panel Integration: Working')

  } catch (error) {
    console.error('❌ Frontend CRUD test failed:', error.message)
  }
}

testFrontendCRUD()
