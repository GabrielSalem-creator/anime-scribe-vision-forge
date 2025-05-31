
export class ImageService {
  private apiKeys: string[];
  private baseUrl: string;
  private currentKeyIndex: number = 0;

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys;
    this.baseUrl = "https://ir-api.myqa.cc/v1/openai/images/generations";
  }

  private getNextApiKey(): string {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  async generateImage(prompt: string): Promise<string> {
    const enhancedPrompt = this.enhancePrompt(prompt);
    const apiKey = this.getNextApiKey();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: "stabilityai/sdxl-turbo:free",
          quality: "auto"
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        // Convert base64 to data URL
        return `data:image/png;base64,${data.data[0].b64_json}`;
      } else {
        throw new Error('No image data in response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please try again.');
    }
  }

  async generateImagesParallel(prompts: string[]): Promise<(string | null)[]> {
    const batchSize = this.apiKeys.length;
    const results: (string | null)[] = new Array(prompts.length).fill(null);
    
    // Process in batches to utilize all API keys simultaneously
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (prompt, batchIndex) => {
        try {
          const imageUrl = await this.generateImage(prompt);
          results[i + batchIndex] = imageUrl;
          return { index: i + batchIndex, imageUrl };
        } catch (error) {
          console.error(`Error generating image for batch index ${batchIndex}:`, error);
          results[i + batchIndex] = null;
          return { index: i + batchIndex, imageUrl: null };
        }
      });

      // Wait for the current batch to complete before starting the next
      await Promise.all(batchPromises);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  private enhancePrompt(prompt: string): string {
    // Enhance the prompt for better anime-style image generation
    const baseEnhancement = "anime style, high quality, detailed, vibrant colors, professional anime art, ";
    const artisticEnhancement = ", studio lighting, masterpiece, best quality, extremely detailed, beautiful, cinematic composition";
    
    return baseEnhancement + prompt + artisticEnhancement;
  }
}
