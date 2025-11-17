import axios from 'axios';

// Product type definition to match DummyJSON products structure
export interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
}


const API_BASE_URL = import.meta.env.VITE_SECRET_API_BASE_URL || 'https://dummyjson.com';


console.log('Secret API URL:', API_BASE_URL);

// Product API functions with pagination
export async function fetchProducts(skip = 0, limit = 10): Promise<{ products: Product[], total: number, skip: number, limit: number }> {
  try {
    const res = await axios.get(`${API_BASE_URL}?limit=${limit}&skip=${skip}`);
    const products: Product[] = res.data.products.map((product: any) => ({
      id: product.id,
      title: product.title || 'N/A',
      brand: product.brand || 'N/A',
      category: product.category || 'N/A',
      price: product.price || 0,
      rating: product.rating || 0,
      stock: product.stock || 0,
      description: product.description || 'N/A',
    }));
    return {
      products,
      total: res.data.total || 0,
      skip: res.data.skip || 0,
      limit: res.data.limit || limit
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, skip: 0, limit };
  }
}

export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const res = await axios.get(`${API_BASE_URL}/${id}`);
    return {
      id: res.data.id,
      title: res.data.title || 'N/A',
      brand: res.data.brand || 'N/A',
      category: res.data.category || 'N/A',
      price: res.data.price || 0,
      rating: res.data.rating || 0,
      stock: res.data.stock || 0,
      description: res.data.description || 'N/A',
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Export individual functions
export const productApi = {
  fetchProducts,
  fetchProductById,
};

export default fetchProducts;