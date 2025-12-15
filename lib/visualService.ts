import { pipeline, env } from '@xenova/transformers';

// Configure to skip local check and use CDN by default for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class VisualServiceClass {
  private classifier: any = null;
  // Switching to standard V3 for maximum compatibility
  private modelName = 'Xenova/mobilenet_v3_small_1.0_224_quantized';

  async initialize() {
    if (!this.classifier) {
      console.log("Loading Visual Model: " + this.modelName);
      try {
        this.classifier = await pipeline('image-classification', this.modelName);
      } catch (e) {
        console.error("Failed to load model", e);
        throw e;
      }
    }
  }

  async classifyImage(imageBlob: Blob): Promise<string[]> {
    try {
      await this.initialize();
      
      const imageUrl = URL.createObjectURL(imageBlob);
      const output = await this.classifier(imageUrl);
      URL.revokeObjectURL(imageUrl);

      // Output is usually [{ label: 'cat', score: 0.9 }, ...]
      console.log("Visual Config:", output);

      return output
        .filter((res: any) => res.score > 0.1) // Filter low confidence (lowered to 10%)
        .map((res: any) => res.label.split(',')[0]) // Take first synonym
        .slice(0, 5); // Top 5 tags
        
    } catch (error) {
      console.error("Classification error:", error);
      return [];
    }
  }
}

export const VisualService = new VisualServiceClass();
