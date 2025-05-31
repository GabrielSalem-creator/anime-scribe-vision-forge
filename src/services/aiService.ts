
export interface StoryGenerationRequest {
  story: string;
  duration: number;
  genre: string;
  artStyle: string;
  setting: string;
  mood: string;
  characterCount: number;
  pacing: string;
  specialEffects: string;
  cameraStyle: string;
}

export interface GeneratedScene {
  timestamp: number;
  scene: number;
  description: string;
  dialogue?: string;
  characters: string[];
  setting: string;
  visualPrompt: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://openrouter.ai/api/v1";
  }

  async generateStoryScript(request: StoryGenerationRequest): Promise<GeneratedScene[]> {
    const scenesCount = Math.ceil(request.duration / 3); // One scene every 3 seconds
    
    const prompt = this.buildStoryPrompt(request, scenesCount);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Anime Story Creator',
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: [
            {
              role: "system",
              content: "You are an expert anime scriptwriter and visual director. You create detailed scene breakdowns with precise visual descriptions for anime sequences."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseStoryResponse(content, request.duration);
    } catch (error) {
      console.error('Error generating story script:', error);
      throw new Error('Failed to generate story script. Please try again.');
    }
  }

  private buildStoryPrompt(request: StoryGenerationRequest, scenesCount: number): string {
    return `
Create a detailed anime script breakdown for the following story:

Story: "${request.story}"
Duration: ${request.duration} seconds (${scenesCount} scenes, 3 seconds each)
Genre: ${request.genre}
Art Style: ${request.artStyle}
Setting: ${request.setting}
Mood: ${request.mood}
Character Count: ${request.characterCount}
Pacing: ${request.pacing}
Special Effects: ${request.specialEffects}
Camera Style: ${request.cameraStyle}

Please provide EXACTLY ${scenesCount} scenes in JSON format. Each scene should be 3 seconds long and include:

1. Timestamp (in seconds)
2. Scene number
3. Detailed scene description (what's happening)
4. Dialogue (if any characters are speaking)
5. Characters present in the scene
6. Setting description
7. Extremely detailed visual prompt for image generation (include character appearances, clothing, expressions, lighting, camera angles, background details, colors, atmosphere)

Format your response as a JSON array of scenes. Make the visual prompts very detailed and specific for anime art generation, including:
- Character physical descriptions (hair color, eye color, clothing, expressions)
- Lighting conditions (dramatic lighting, soft glow, etc.)
- Camera angles and composition
- Background and environment details
- Art style specifications
- Color palette and mood

Example format:
[
  {
    "timestamp": 0,
    "scene": 1,
    "description": "Opening scene description...",
    "dialogue": "Character dialogue...",
    "characters": ["Character 1", "Character 2"],
    "setting": "Detailed setting description...",
    "visualPrompt": "Extremely detailed visual description for image generation..."
  }
]

Make sure the story flows naturally across all ${scenesCount} scenes and captures the essence of the original story.
`;
  }

  private parseStoryResponse(content: string, duration: number): GeneratedScene[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const scenes = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure proper timestamps
      return scenes.map((scene: any, index: number) => ({
        timestamp: index * 3,
        scene: index + 1,
        description: scene.description || `Scene ${index + 1} description`,
        dialogue: scene.dialogue || undefined,
        characters: Array.isArray(scene.characters) ? scene.characters : [`Character ${index + 1}`],
        setting: scene.setting || 'Unknown setting',
        visualPrompt: scene.visualPrompt || scene.description || `Scene ${index + 1} visual`
      }));
    } catch (error) {
      console.error('Error parsing story response:', error);
      
      // Fallback: create basic scenes
      const scenesCount = Math.ceil(duration / 3);
      return Array.from({ length: scenesCount }, (_, index) => ({
        timestamp: index * 3,
        scene: index + 1,
        description: `Scene ${index + 1} from the story`,
        characters: ['Main Character'],
        setting: 'Story setting',
        visualPrompt: `Anime style scene ${index + 1} based on the story`
      }));
    }
  }
}
