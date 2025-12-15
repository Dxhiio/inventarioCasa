import { createWorker } from 'tesseract.js';

export const OCRService = {
  async recognizeText(imageBlob: Blob): Promise<string | null> {
    try {
      const worker = await createWorker('eng+spa', 1, {
        logger: m => console.log(m), // Add logging
        errorHandler: e => console.error(e),
      });
      
      // Convert blob to base64 or URL
      const imageUrl = URL.createObjectURL(imageBlob);
      
      const ret = await worker.recognize(imageUrl);
      await worker.terminate();
      
      // Clean up text: remove special chars, short words
      const text = ret.data.text
        .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      URL.revokeObjectURL(imageUrl);
      
      // Filter for meaningful keywords (length > 2)
      const meaningful = text.split(' ').filter(w => w.length > 2).join(' ');
      
      return meaningful.length > 3 ? meaningful : null;
    } catch (e) {
      console.error("OCR Failed", e);
      return null;
    }
  }
};
