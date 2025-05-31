
export class ImageService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://ir-api.myqa.cc/v1/openai/images/generations";
  }

  async generateImage(prompt: string): Promise<string> {
    const enhancedPrompt = this.enhancePrompt(prompt);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

  private enhancePrompt(prompt: string): string {
    // Enhance the prompt for better anime-style image generation
    const baseEnhancement = "anime style, high quality, detailed, vibrant colors, professional anime art, ";
    const artisticEnhancement = ", studio lighting, masterpiece, best quality, extremely detailed, beautiful, cinematic composition";
    
    return baseEnhancement + prompt + artisticEnhancement;
  }
}
