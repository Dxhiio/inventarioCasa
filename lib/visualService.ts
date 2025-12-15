import { pipeline, env } from '@xenova/transformers';

// Configure to skip local check and use CDN by default for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class VisualServiceClass {
  private classifier: any = null;
  private modelName = 'Xenova/mobilenet_v4_e12_050_224'; // Fast, lightweight

  async initialize() {
    if (!this.classifier) {
      console.log("Loading Visual Model: " + this.modelName);
      try {
        this.classifier = await pipeline('image-classification', this.modelName);
      } catch (e) {
        console.error("Failed to load primary model, trying fallback...", e);
        // Fallback to older but reliable mobilenet
        this.classifier = await pipeline('image-classification', 'Xenova/mobilenet_v3_small_1.0_224_quantized');
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
        .filter((res: any) => res.score > 0.25) // Filter low confidence
        .map((res: any) => res.label.split(',')[0]) // Take first synonym (e.g. 'mouse, computer mouse' -> 'mouse')
        .slice(0, 2); // Top 2 tags
        
    } catch (error) {
      console.error("Classification error:", error);
      return [];
    }
  }
}

export const VisualService = new VisualServiceClass();
