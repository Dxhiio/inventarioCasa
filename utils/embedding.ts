'use client'

// Singleton pattern to prevent reloading the model on every render
class EmbeddingService {
  static instance: any = null
  static modelName = 'Xenova/all-MiniLM-L6-v2'

  static async getInstance() {
    if (this.instance === null) {
      try {
        // Dynamic import to avoid build-time issues
        const { pipeline } = await import('@xenova/transformers')
        
        // Create pipeline (feature-extraction)
        this.instance = await pipeline('feature-extraction', this.modelName)
      } catch (e) {
        console.error("Failed to load Transformers.js:", e)
        // Fallback: Return a dummy object that produces random vectors
        // This keeps the app alive even if AI fails to load
        this.instance = async (text: string) => {
             console.warn("Using MOCK embeddings due to load failure.")
             return { data: new Float32Array(384).fill(0.1) } // Dummy vector
        }
      }
    }
    return this.instance
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const extractor = await this.getInstance()
    
    // Generate embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    
    // Convert Tensor to standard array
    return Array.from(output.data)
  }
}

export default EmbeddingService
