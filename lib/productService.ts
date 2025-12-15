export interface ProductInfo {
  name: string;
  image_url: string | null;
  brands: string | null;
  categories: string | null;
}

// Endpoints to check sequentially
const API_ENDPOINTS = [
  "https://world.openfoodfacts.org/api/v0/product",
  "https://world.openbeautyfacts.org/api/v2/product",
  "https://world.openpetfoodfacts.org/api/v2/product",
  "https://world.openproductsfacts.org/api/v2/product"
];

export const ProductService = {
  async searchProductByBarcode(barcode: string): Promise<ProductInfo | null> {
    
    // Helper to fetch from a single endpoint
    const fetchFromEndpoint = async (baseUrl: string): Promise<ProductInfo | null> => {
       const isV2 = baseUrl.includes("/v2/");
       const url = isV2 ? `${baseUrl}/${barcode}.json` : `${baseUrl}/${barcode}.json`; // Both use similar suffix structure mostly, but v2 acts slightly differently. 
       // Actually OFF v2 url is /api/v2/product/{barcode}. v0 is /api/v0/product/{barcode}.json
       // Let's standardize on the .json extension which works for both v0 and v2 for reading usually, 
       // or careful construction.
       
       // Official docs say: https://world.openfoodfacts.net/api/v2/product/{barcode} returns JSON directly.
       // Let's stick to the v0 style for all first as it's most robust, or try valid URLs found in research.
       
       // Research showed: https://world.openbeautyfacts.org/api/v2/product/[barcode].json
       
       try {
         const res = await fetch(url, {
            headers: {
                'User-Agent': 'InventarioCasaApp/1.0 (Integration Test)'
            }
         });
         if (!res.ok) return null;
         
         const data = await res.json();
         // Check status: 1 = found (v0), status = 1 (v2 often same)
         // Note: v2 might return just product object or different wrapper.
         // Most 'open*facts' legacy compatible endpoints use status 1.
         
         if (data.status === 1 && data.product) {
            return {
              name: data.product.product_name_es || data.product.product_name || 'Producto sin nombre',
              image_url: data.product.image_url || data.product.image_front_url || null,
              brands: data.product.brands || null,
              categories: data.product.categories || null,
            };
         }
       } catch (e) {
         // Silently fail this endpoint
       }
       return null;
    };

    // Iterate endpoints
    for (const base of API_ENDPOINTS) {
        const result = await fetchFromEndpoint(base);
        if (result) return result;
    }

    return null;
  },

  async searchProductByName(query: string): Promise<ProductInfo[] | null> {
    try {
      // Use OpenFoodFacts search API
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
      
      const res = await fetch(url, {
         headers: { 'User-Agent': 'InventarioCasaApp/1.0' }
      });
      const data = await res.json();
      
      if (data.products && data.products.length > 0) {
        return data.products.slice(0, 5).map((p: any) => ({
            name: p.product_name_es || p.product_name || 'Desconocido',
            image_url: p.image_url || p.image_front_url || null,
            brands: p.brands || null,
            categories: p.categories || null
        }));
      }
      return null;
    } catch (e) {
      console.error("Search by name failed", e);
      return null;
    }
  }
};
