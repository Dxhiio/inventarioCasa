export interface ProductInfo {
  name: string;
  image_url: string | null;
  brands: string | null;
  categories: string | null;
}

export const ProductService = {
  async searchProductByBarcode(barcode: string): Promise<ProductInfo | null> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        return {
          name: data.product.product_name_es || data.product.product_name || 'Producto desconocido',
          image_url: data.product.image_url || data.product.image_front_url || null,
          brands: data.product.brands || null,
          categories: data.product.categories || null,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
};
