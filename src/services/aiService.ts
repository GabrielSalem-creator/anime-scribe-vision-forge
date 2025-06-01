
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
    
    const prompt = this.buildAdvancedStoryPrompt(request, scenesCount);
    
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
              content: "You are a master anime storyteller and visual director with expertise in creating compelling, coherent narratives. You specialize in breaking down stories into perfectly timed visual sequences that flow naturally and maintain audience engagement. Your stories are always clear, emotionally resonant, and visually stunning."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 6000
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

  private buildAdvancedStoryPrompt(request: StoryGenerationRequest, scenesCount: number): string {
    return `
ANIME STORY CREATION MASTERCLASS

You are creating a ${scenesCount}-second anime sequence based on this story concept:
"${request.story}"

STORY SPECIFICATIONS:
- Genre: ${request.genre}
- Art Style: ${request.artStyle}
- Setting: ${request.setting}
- Mood: ${request.mood}
- Character Count: ${request.characterCount}
- Pacing: ${request.pacing}
- Special Effects: ${request.specialEffects}
- Camera Style: ${request.cameraStyle}

CRITICAL REQUIREMENTS FOR STORY COHERENCE:

1. NARRATIVE STRUCTURE:
   - Create a clear beginning, middle, and end
   - Each scene must logically connect to the next
   - Maintain consistent character behavior and motivation
   - Build tension/emotion progressively
   - Ensure the story has a satisfying resolution

2. CHARACTER CONSISTENCY:
   - Keep character descriptions identical throughout all scenes
   - Maintain personality traits across scenes
   - Show clear character emotions and reactions
   - Give characters specific goals and obstacles

3. VISUAL CONTINUITY:
   - Maintain consistent art style and lighting
   - Keep settings logically connected
   - Show smooth transitions between scenes
   - Ensure props and costumes remain consistent

4. PACING AND FLOW:
   - Vary shot types for visual interest (close-ups, wide shots, medium shots)
   - Balance action scenes with emotional moments
   - Use appropriate camera movements for the mood
   - Create natural breathing room in dialogue

5. DIALOGUE QUALITY:
   - Write natural, character-appropriate dialogue
   - Keep dialogue concise and impactful
   - Show character personality through speech patterns
   - Advance the plot through conversations

SCENE BREAKDOWN INSTRUCTIONS:

Create EXACTLY ${scenesCount} scenes in this JSON format. Each scene represents 1 second of video:

EXAMPLE STRUCTURE:
[
  {
    "timestamp": 0,
    "scene": 1,
    "description": "Clear, specific description of what happens in this scene",
    "dialogue": "Character Name: 'Exact dialogue here'" (only if someone speaks),
    "characters": ["Character Name 1", "Character Name 2"],
    "setting": "Specific location description",
    "visualPrompt": "DETAILED visual prompt following the format below"
  }
]

VISUAL PROMPT FORMAT (BE EXTREMELY DETAILED):

For each scene, create a visual prompt that includes ALL these elements:

**CHARACTER DETAILS:**
- Full character descriptions (age, gender, height, build, facial features)
- Complete outfit descriptions (clothing, colors, accessories, footwear)
- Specific facial expressions showing clear emotions
- Exact body language and positioning
- Hair style, color, and length
- Eye color and expression

**ACTION & MOVEMENT:**
- Precise description of what the character is doing
- Body positioning and gestures
- Eye direction and focus
- Movement type (walking, running, standing, sitting, etc.)

**ENVIRONMENT:**
- Complete setting description (indoor/outdoor, time of day, weather)
- Background elements (furniture, objects, landscape, architecture)
- Lighting conditions (natural/artificial, direction, intensity, shadows)
- Atmosphere and mood elements

**CAMERA & COMPOSITION:**
- Shot type (close-up, medium shot, wide shot, extreme close-up)
- Camera angle (eye level, high angle, low angle, dutch angle)
- Camera movement (static, pan, tilt, zoom, tracking)
- Composition style (rule of thirds, centered, dynamic)

**ART STYLE & TECHNICAL:**
- Specific anime art style (Studio Ghibli, modern anime, classic anime)
- Color palette and mood
- Shading and lighting style
- Line art quality and style
- Background detail level

EXAMPLE VISUAL PROMPT:
"High-quality anime art, Studio Ghibli style. CHARACTER: 16-year-old female protagonist, 5'3\", slender build, large expressive violet eyes, shoulder-length auburn hair with side bangs, fair skin with light freckles, wearing white school uniform blouse with navy blue sailor collar, red ribbon tie, dark blue pleated skirt, white knee-high socks, brown loafers. EXPRESSION: Determined smile with slightly furrowed brow showing concentration, looking directly forward with confident posture. ACTION: Standing at school entrance gate, right hand gripping backpack strap, left hand holding acceptance letter, body slightly leaning forward in anticipation. SETTING: Japanese high school entrance with cherry blossom trees in full bloom, morning sunlight filtering through pink petals, traditional school building architecture in background, stone pathway leading to main entrance. CAMERA: Medium shot from slightly low angle to emphasize determination, centered composition. LIGHTING: Soft morning sunlight from upper left creating gentle shadows, warm golden rim lighting on hair. COLORS: Warm spring palette with soft pinks, whites, and blues, high contrast for emotional impact. STYLE: Clean anime line art with detailed shading, vibrant but natural colors, detailed background with depth of field effect."

STORYTELLING FLOW:
- Scene 1-3: Establish setting, introduce main character(s), set up the situation
- Scene 4-6: Build tension, introduce conflict or challenge
- Scene 7-9: Develop the conflict, show character reactions and decisions
- Scene 10-12: Climax or turning point of the story
- Scene 13-15: Resolution, character growth, emotional payoff
(Adjust based on your ${scenesCount} scenes)

Now create a compelling, coherent ${scenesCount}-scene anime sequence that tells a complete, satisfying story.
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
      
      // Fallback: create basic scenes with better structure
      const scenesCount = duration;
      return Array.from({ length: scenesCount }, (_, index) => {
        const progress = index / (scenesCount - 1);
        let sceneType = '';
        let description = '';
        
        if (progress <= 0.2) {
          sceneType = 'Introduction';
          description = `Opening scene establishing the story and main character in a ${request.setting} setting`;
        } else if (progress <= 0.4) {
          sceneType = 'Setup';
          description = `Building tension and introducing the main conflict or challenge`;
        } else if (progress <= 0.6) {
          sceneType = 'Development';
          description = `Character faces obstacles and makes important decisions`;
        } else if (progress <= 0.8) {
          sceneType = 'Climax';
          description = `Peak dramatic moment where the main conflict reaches its height`;
        } else {
          sceneType = 'Resolution';
          description = `Conclusion showing the outcome and character growth`;
        }
        
        return {
          timestamp: index,
          scene: index + 1,
          description: `${sceneType}: ${description}`,
          characters: ['Main Character'],
          setting: 'Story setting',
          visualPrompt: `High-quality ${request.artStyle} anime art. ${description}. Detailed character in ${request.setting} with ${request.mood} atmosphere, ${request.cameraStyle} camera work, professional anime production quality.`
        };
      });
    }
  }
}
