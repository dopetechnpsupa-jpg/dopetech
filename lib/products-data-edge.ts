import { supabaseEdge, supabaseEdgeAdmin, createCachedResponse } from './supabase-edge'

// Product Image type definition
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  file_name?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image_url: string; // Keep for backward compatibility - will be the primary image
  images?: ProductImage[]; // New field for multiple images
  category: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  color?: string; // Product color - optional field
  in_stock: boolean;
  discount: number;
  hidden_on_home?: boolean;
}

// Sample fallback products data for Edge Functions
const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Gaming Keyboard Pro",
    price: 129.99,
    original_price: 159.99,
    image_url: "/products/keyboard.png",
    category: "keyboard",
    rating: 4.8,
    reviews: 245,
    description: "Premium mechanical gaming keyboard with RGB lighting and programmable keys",
    features: ["Mechanical switches", "RGB lighting", "Programmable keys", "Wrist rest"],
    in_stock: true,
    discount: 19,
    hidden_on_home: false
  },
  {
    id: 2,
    name: "Wireless Gaming Mouse",
    price: 89.99,
    original_price: 119.99,
    image_url: "/products/key.png",
    category: "mouse",
    rating: 4.7,
    reviews: 189,
    description: "High-precision wireless gaming mouse with customizable DPI",
    features: ["Wireless", "Customizable DPI", "RGB lighting", "Ergonomic design"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 3,
    name: "Premium Headphones",
    price: 199.99,
    original_price: 249.99,
    image_url: "/products/Screenshot 2025-08-02 215007.png",
    category: "audio",
    rating: 4.9,
    reviews: 312,
    description: "Studio-quality headphones with noise cancellation",
    features: ["Noise cancellation", "Bluetooth", "40-hour battery", "Premium audio"],
    in_stock: true,
    discount: 20,
    hidden_on_home: false
  },
  {
    id: 4,
    name: "Gaming Monitor",
    price: 299.99,
    original_price: 399.99,
    image_url: "/products/Screenshot 2025-08-02 215024.png",
    category: "monitor",
    rating: 4.6,
    reviews: 156,
    description: "27-inch 144Hz gaming monitor with 1ms response time",
    features: ["144Hz refresh rate", "1ms response", "FreeSync", "HDR support"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  },
  {
    id: 5,
    name: "Gaming Speaker System",
    price: 149.99,
    original_price: 199.99,
    image_url: "/products/Screenshot 2025-08-02 215110.png",
    category: "speaker",
    rating: 4.5,
    reviews: 98,
    description: "Immersive gaming speaker system with subwoofer",
    features: ["2.1 Channel", "Subwoofer", "RGB lighting", "Gaming optimized"],
    in_stock: true,
    discount: 25,
    hidden_on_home: false
  }
];

// Edge-optimized function to fetch products with caching
export async function getProductsEdge(): Promise<Response> {
  try {
    console.log('🔗 Edge: Connecting to Supabase...')
    
    // Add a timeout to prevent hanging - reduced to 10 seconds for Edge Functions
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Supabase connection took too long')), 10000)
    })
    
    const supabasePromise = supabaseEdge
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Edge: Supabase error:', error);
      // Return fallback data with cache headers
      return createCachedResponse(fallbackProducts, 'products');
    }

    console.log('✅ Edge: Supabase query successful')
    console.log('📦 Edge: Data received:', data?.length || 0, 'products')
    
    // If no data or empty array, use fallback
    if (!data || data.length === 0) {
      console.log('⚠️ Edge: No products in database, using fallback')
      return createCachedResponse(fallbackProducts, 'products');
    }
    
    const products = (data as unknown as Product[]) || [];
    return createCachedResponse(products, 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching products from Supabase:', error);
    console.log('🔄 Edge: Falling back to local products data...')
    
    // Return fallback products with cache headers
    return createCachedResponse(fallbackProducts, 'products');
  }
}

// Edge-optimized function to fetch a single product by ID
export async function getProductByIdEdge(id: number): Promise<Response> {
  try {
    const { data, error } = await supabaseEdge
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Edge: Error fetching product:', error);
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return createCachedResponse(data as unknown as Product, 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching product:', error);
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// Edge-optimized function to fetch products by category
export async function getProductsByCategoryEdge(category: string): Promise<Response> {
  try {
    const { data, error } = await supabaseEdge
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Edge: Error fetching products by category:', error);
      return createCachedResponse([], 'products');
    }

    const products = (data as unknown as Product[]) || [];
    return createCachedResponse(products, 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching products by category:', error);
    return createCachedResponse([], 'products');
  }
}

// Edge-optimized function to get random dope picks
export async function getDopePicksEdge(maxCount: number = 6): Promise<Response> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const supabasePromise = supabaseEdge
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Edge: Supabase error:', error);
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return createCachedResponse(shuffled.slice(0, Math.min(maxCount, shuffled.length)), 'products');
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Edge: No products in database for dope picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return createCachedResponse(shuffled.slice(0, Math.min(maxCount, shuffled.length)), 'products');
    }

    // Randomly shuffle the products and take up to maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    return createCachedResponse(shuffled.slice(0, Math.min(maxCount, shuffled.length)), 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching dope picks:', error);
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    return createCachedResponse(shuffled.slice(0, Math.min(maxCount, shuffled.length)), 'products');
  }
}

// Edge-optimized function to get random weekly picks
export async function getWeeklyPicksEdge(maxCount: number = 4): Promise<Response> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    })
    
    const supabasePromise = supabaseEdge
      .from('products')
      .select('*')
      .eq('hidden_on_home', false)
      .order('id', { ascending: true });

    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

    if (error) {
      console.error('❌ Edge: Supabase error:', error);
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return createCachedResponse(duplicateProductsToFill(shuffled, maxCount), 'products');
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Edge: No products in database for weekly picks, using fallback')
      const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
      return createCachedResponse(duplicateProductsToFill(shuffled, maxCount), 'products');
    }

    // Randomly shuffle the products and duplicate if needed to fill maxCount
    const shuffled = [...(data as unknown as Product[])].sort(() => Math.random() - 0.5);
    return createCachedResponse(duplicateProductsToFill(shuffled, maxCount), 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching weekly picks:', error);
    const shuffled = [...fallbackProducts].sort(() => Math.random() - 0.5);
    return createCachedResponse(duplicateProductsToFill(shuffled, maxCount), 'products');
  }
}

// Helper function to duplicate products to fill the required count
function duplicateProductsToFill(products: Product[], maxCount: number): Product[] {
  if (products.length === 0) {
    return [];
  }
  
  // If we need more products than available, duplicate them
  if (maxCount > products.length) {
    const result = [];
    for (let i = 0; i < maxCount; i++) {
      const product = products[i % products.length];
      // Create a unique copy with a modified ID to avoid conflicts
      result.push({
        ...product,
        id: product.id * 1000 + i // Make each copy unique
      });
    }
    return result;
  }
  
  return products.slice(0, maxCount);
}

// Edge-optimized function to get product images
export async function getProductImagesEdge(productId: number): Promise<Response> {
  try {
    const { data, error } = await supabaseEdge
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ Edge: Error fetching product images:', error);
      return createCachedResponse([], 'productImages');
    }

    const images = (data as unknown as ProductImage[]) || [];
    return createCachedResponse(images, 'productImages');
  } catch (error) {
    console.error('❌ Edge: Error fetching product images:', error);
    return createCachedResponse([], 'productImages');
  }
}

// Edge-optimized function to get products with images
export async function getProductsWithImagesEdge(): Promise<Response> {
  try {
    const productsResponse = await getProductsEdge();
    const products = await productsResponse.json() as Product[];
    
    // Fetch images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imagesResponse = await getProductImagesEdge(product.id);
        const images = await imagesResponse.json() as ProductImage[];
        return {
          ...product,
          images: images
        };
      })
    );

    return createCachedResponse(productsWithImages, 'products');
  } catch (error) {
    console.error('❌ Edge: Error fetching products with images:', error);
    return createCachedResponse([], 'products');
  }
}

// Admin functions for write operations (no caching)
export async function addProductEdge(productData: Omit<Product, 'id' | 'rating' | 'reviews'> & { features?: string[], color?: string }): Promise<Response> {
  try {
    const { data, error } = await supabaseEdgeAdmin
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
      console.error('❌ Edge: Error adding product:', error);
      return Response.json({ error: 'Failed to add product', details: error.message }, { status: 500 });
    }

    return Response.json(data as unknown as Product);
  } catch (error) {
    console.error('❌ Edge: Error adding product:', error);
    return Response.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function updateProductEdge(productId: number, productData: Partial<Omit<Product, 'id' | 'rating' | 'reviews'>> & { features?: string[], color?: string }): Promise<Response> {
  try {
    const { data, error } = await supabaseEdgeAdmin
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
      console.error('❌ Edge: Error updating product:', error);
      return Response.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
    }

    return Response.json(data as unknown as Product);
  } catch (error) {
    console.error('❌ Edge: Error updating product:', error);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function deleteProductEdge(productId: number): Promise<Response> {
  try {
    // First, delete all product images to handle foreign key constraint
    const { error: imagesError } = await supabaseEdgeAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (imagesError) {
      console.error('❌ Edge: Error deleting product images:', imagesError);
      // Continue anyway, might not have images
    }

    // Then delete the product
    const { error } = await supabaseEdgeAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('❌ Edge: Error deleting product:', error);
      return Response.json({ error: 'Failed to delete product', details: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('❌ Edge: Error deleting product:', error);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
