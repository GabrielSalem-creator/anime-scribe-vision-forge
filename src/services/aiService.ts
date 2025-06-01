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
              content: "You are a master anime storyteller and visual director specializing in creating compelling, coherent narratives with perfect pacing and emotional depth. Your expertise lies in breaking down complex stories into visually stunning sequences that flow seamlessly and maintain audience engagement throughout. You excel at character development, world-building, and creating emotionally resonant moments that stick with viewers."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseStoryResponse(content, request);
    } catch (error) {
      console.error('Error generating story script:', error);
      throw new Error('Failed to generate story script. Please try again.');
    }
  }

  private buildAdvancedStoryPrompt(request: StoryGenerationRequest, scenesCount: number): string {
    return `
MASTER ANIME STORYTELLING FRAMEWORK

You are creating a ${scenesCount}-frame anime sequence based on this story concept:
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

CRITICAL STORYTELLING PRINCIPLES:

1. NARRATIVE COHERENCE & FLOW:
   - Create a clear three-act structure with distinct beginning, middle, and end
   - Each scene must logically connect to the next with smooth transitions
   - Build tension progressively towards a satisfying climax
   - Ensure character motivations are clear and consistent
   - Every scene should advance the plot or develop character
   - Create emotional beats that resonate with the audience

2. CHARACTER DEVELOPMENT:
   - Maintain consistent character appearance and personality throughout
   - Show clear character growth or change across the sequence
   - Give characters specific, relatable goals and meaningful obstacles
   - Express emotions through facial expressions, body language, and dialogue
   - Create distinct character voices and speech patterns

3. VISUAL STORYTELLING MASTERY:
   - Use varied shot compositions (close-ups for emotion, wide shots for scale)
   - Implement dynamic camera movements that enhance the story
   - Create visual metaphors and symbolism that reinforce themes
   - Maintain consistent lighting and art direction throughout
   - Use color psychology to enhance mood and emotion

4. PACING & RHYTHM:
   - Balance fast-paced action with quiet character moments
   - Create natural breathing room between intense scenes
   - Use dialogue strategically - not every scene needs words
   - Build anticipation before major story moments
   - End with impact that leaves a lasting impression

5. DIALOGUE EXCELLENCE:
   - Write natural, character-appropriate dialogue that sounds authentic
   - Keep lines concise but impactful
   - Show personality through unique speech patterns
   - Use subtext - characters don't always say what they mean
   - Advance plot through meaningful conversations

SCENE CREATION FRAMEWORK:

Create EXACTLY ${scenesCount} scenes in this JSON format. Each scene represents one frame of animation:

REQUIRED JSON STRUCTURE:
[
  {
    "timestamp": 0,
    "scene": 1,
    "description": "Detailed scene description focusing on story progression",
    "dialogue": "Character Name: 'Impactful dialogue that advances plot'" (only when necessary),
    "characters": ["Character Name 1", "Character Name 2"],
    "setting": "Specific, atmospheric location description",
    "visualPrompt": "ULTRA-DETAILED visual prompt following the format below"
  }
]

ULTRA-DETAILED VISUAL PROMPT REQUIREMENTS:

Each visual prompt must include ALL these elements for maximum clarity:

**CHARACTER SPECIFICATIONS:**
- Complete physical description (age, gender, height, build, distinctive features)
- Detailed outfit description (clothing style, colors, textures, accessories)
- Precise facial expression showing specific emotions
- Exact body positioning and gestures
- Hair style, length, color, and how it moves
- Eye color, expression, and where they're looking
- Any unique character traits or markings

**ACTION & MOVEMENT:**
- Specific action being performed in this frame
- Body language that conveys emotion and intent
- Hand gestures and their meaning
- Facial micro-expressions
- Movement direction and energy level

**ENVIRONMENT & ATMOSPHERE:**
- Complete setting description (time of day, weather, season)
- Background elements that enhance the story
- Lighting conditions (source, intensity, shadows, atmosphere)
- Architectural or natural elements
- Objects that tell part of the story

**CINEMATIC COMPOSITION:**
- Shot type (extreme close-up, close-up, medium, wide, establishing)
- Camera angle (eye level, high, low, dutch, bird's eye, worm's eye)
- Camera movement (static, pan, tilt, zoom, dolly, tracking)
- Composition rules (rule of thirds, leading lines, framing)
- Depth of field and focus points

**ART STYLE & TECHNICAL:**
- Specific anime style (Studio Ghibli, Makoto Shinkai, classic 90s anime)
- Color palette and mood enhancement
- Lighting style (soft, dramatic, rim lighting, volumetric)
- Line art quality and shading technique
- Background detail level and artistic approach
- Special effects if applicable

EXAMPLE VISUAL PROMPT:
"High-quality anime art in Makoto Shinkai style with photorealistic lighting. CHARACTER: 17-year-old female protagonist, 5'4", athletic build, determined violet eyes with golden flecks, shoulder-length auburn hair with natural wave catching sunlight, fair skin with subtle freckles across nose, wearing cream-colored school blazer with gold buttons, navy blue pleated skirt, white blouse with loose collar, brown leather school bag slung over right shoulder. EXPRESSION: Confident smile with slight determination furrow in brow, eyes focused on distant horizon, chin lifted slightly showing resolve. ACTION: Standing at crossroads with arms crossed, weight shifted to left leg, hair gently flowing in evening breeze, casting long shadow across cobblestone path. SETTING: Japanese countryside crossroads at golden hour, cherry blossom petals drifting through warm evening light, traditional wooden signposts pointing in multiple directions, rolling hills in background with traditional houses, soft clouds in amber sky. CAMERA: Medium shot from slightly low angle to emphasize determination, positioned to show both character and the path choices ahead. LIGHTING: Warm golden hour lighting from upper right, creating rim lighting on hair and soft shadows, volumetric light rays through distant trees. COLORS: Warm golden and amber tones with soft pastels, high contrast between light and shadow for emotional impact. STYLE: Ultra-detailed anime art with realistic lighting effects, crisp line art, detailed background with atmospheric perspective, cinematic composition."

STORY STRUCTURE GUIDE:
- Frames 1-${Math.ceil(scenesCount * 0.2)}: Hook and setup - establish world, character, and initial situation
- Frames ${Math.ceil(scenesCount * 0.2) + 1}-${Math.ceil(scenesCount * 0.4)}: Rising action - introduce conflict and build tension
- Frames ${Math.ceil(scenesCount * 0.4) + 1}-${Math.ceil(scenesCount * 0.6)}: Development - character faces challenges, plot thickens
- Frames ${Math.ceil(scenesCount * 0.6) + 1}-${Math.ceil(scenesCount * 0.8)}: Climax - peak dramatic moment, major revelation or confrontation
- Frames ${Math.ceil(scenesCount * 0.8) + 1}-${scenesCount}: Resolution - wrap up conflict, show character growth, satisfying conclusion

FINAL REQUIREMENTS:
- Every scene must contribute meaningfully to the overall narrative
- Maintain visual and emotional continuity between scenes
- Create a complete, satisfying story arc within the frame count
- End with emotional impact that resonates with viewers
- Ensure the story feels complete, not rushed or incomplete

Now create a masterful ${scenesCount}-frame anime sequence that tells a compelling, emotionally resonant story.
`;
  }

  private parseStoryResponse(content: string, request: StoryGenerationRequest): GeneratedScene[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const scenes = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure proper timestamps (1 frame per scene)
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
      const scenesCount = request.duration;
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
