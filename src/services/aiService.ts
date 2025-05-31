
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
    const scenesCount = request.duration; // One scene per second
    
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
Duration: ${request.duration} seconds (${scenesCount} scenes, 1 second each)
Genre: ${request.genre}
Art Style: ${request.artStyle}
Setting: ${request.setting}
Mood: ${request.mood}
Character Count: ${request.characterCount}
Pacing: ${request.pacing}
Special Effects: ${request.specialEffects}
Camera Style: ${request.cameraStyle}

Please provide EXACTLY ${scenesCount} scenes in JSON format. Each scene should be 1 second long and include:

1. Timestamp (in seconds)
2. Scene number
3. Detailed scene description (what's happening)
4. Dialogue (if any characters are speaking)
5. Characters present in the scene
6. Setting description
7. EXTREMELY detailed visual prompt for image generation

For the visual prompts, be EXTREMELY SPECIFIC and include ALL of these details:
- EXACT character descriptions (age, gender, height, build, facial features, hair color/style/length, eye color, skin tone)
- DETAILED clothing descriptions (style, colors, materials, accessories, footwear)
- PRECISE facial expressions and body language (what emotion, how they're standing/sitting, hand positions, eye direction)
- EXACT actions being performed (step-by-step what the character is doing)
- DETAILED environment description (indoor/outdoor, time of day, weather, lighting conditions)
- SPECIFIC background elements (furniture, objects, landscape features, architecture style)
- CAMERA details (close-up/wide shot/medium shot, angle - high/low/eye level, perspective)
- LIGHTING specifics (natural/artificial, direction, intensity, shadows, highlights)
- COLOR palette (dominant colors, mood colors, contrast levels)
- ART STYLE details (anime style specifics, shading technique, line art style)
- ATMOSPHERE description (mood, feeling, energy level)

Example format:
[
  {
    "timestamp": 0,
    "scene": 1,
    "description": "Opening scene description...",
    "dialogue": "Character dialogue...",
    "characters": ["Character 1", "Character 2"],
    "setting": "Detailed setting description...",
    "visualPrompt": "Anime style, high quality art. [CHARACTER]: 17-year-old female protagonist, 5'4\", athletic build, long flowing black hair with blue highlights tied in high ponytail, bright emerald green eyes, fair skin, wearing navy blue school uniform with white collar, red tie, knee-length pleated skirt, white knee-high socks, black loafers. [EXPRESSION]: Determined smile, confident posture, standing with hands on hips, looking directly at camera. [ACTION]: Standing triumphantly on school rooftop after completing training. [SETTING]: Japanese high school rooftop at sunset, concrete floor with safety railings, city skyline in background, orange and pink sky with scattered clouds. [CAMERA]: Medium shot from slightly low angle to emphasize heroic pose. [LIGHTING]: Warm golden hour lighting from behind creating rim light effect on hair, soft shadows on face. [COLORS]: Warm orange and pink sunset tones contrasting with cool blue uniform colors. [STYLE]: Clean anime art style with detailed shading, sharp line art, vibrant colors, Studio Ghibli influence."
  }
]

Make sure each visual prompt follows this detailed format and the story flows naturally across all ${scenesCount} scenes.
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
      
      // Validate and ensure proper timestamps (1 second per scene)
      return scenes.map((scene: any, index: number) => ({
        timestamp: index,
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
      const scenesCount = duration;
      return Array.from({ length: scenesCount }, (_, index) => ({
        timestamp: index,
        scene: index + 1,
        description: `Scene ${index + 1} from the story`,
        characters: ['Main Character'],
        setting: 'Story setting',
        visualPrompt: `Detailed anime style scene ${index + 1} based on the story with precise character and environment descriptions`
      }));
    }
  }
}
