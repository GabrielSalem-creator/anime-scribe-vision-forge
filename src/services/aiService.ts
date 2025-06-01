
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
    const scenesCount = request.duration;
    
    const prompt = this.buildFocusedStoryPrompt(request, scenesCount);
    
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
              content: "You are an expert anime storyteller who excels at understanding user intent and translating stories into compelling visual sequences. Your primary goal is to stay TRUE to the user's original story concept while creating engaging, coherent anime scenes that match their vision perfectly."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
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

  private buildFocusedStoryPrompt(request: StoryGenerationRequest, scenesCount: number): string {
    return `
CRITICAL: UNDERSTAND AND HONOR USER INTENT

USER'S ORIGINAL STORY CONCEPT:
"${request.story}"

Your PRIMARY MISSION: Take this exact story concept and translate it into ${scenesCount} anime scenes that PERFECTLY match what the user described. Do NOT create a different story - expand and visualize THEIR story.

STORY PARAMETERS:
- Scenes to create: ${scenesCount}
- Genre: ${request.genre}
- Art Style: ${request.artStyle}
- Setting: ${request.setting}
- Mood: ${request.mood}
- Characters: ${request.characterCount}
- Pacing: ${request.pacing}

ESSENTIAL RULES:

1. STORY FIDELITY: The generated scenes MUST directly represent the user's story. If they mention specific events, characters, or plot points, include them ALL.

2. LOGICAL PROGRESSION: Create a clear beginning-middle-end that makes sense for their story concept.

3. CHARACTER CONSISTENCY: If the user mentions specific characters or character types, maintain them throughout.

4. SETTING CONSISTENCY: Honor the user's implied or explicit setting choices.

SCENE CREATION INSTRUCTIONS:

Create EXACTLY ${scenesCount} scenes in this JSON format:

[
  {
    "timestamp": 0,
    "scene": 1,
    "description": "Clear description of what happens in this scene that advances the user's story",
    "dialogue": "Character: 'Meaningful dialogue that fits the story'" (only when it adds value),
    "characters": ["Character names that fit the user's story"],
    "setting": "Location that matches the user's story and chosen setting",
    "visualPrompt": "Detailed visual description for anime art generation"
  }
]

VISUAL PROMPT REQUIREMENTS:
Each visualPrompt must be highly detailed and include:

- CHARACTER DETAILS: Age, appearance, clothing, expression, pose
- ACTION: What is happening in this exact moment
- SETTING: Detailed environment description
- MOOD: Lighting and atmosphere that matches ${request.mood}
- STYLE: ${request.artStyle} anime art style
- COMPOSITION: Camera angle and framing

EXAMPLE VISUAL PROMPT FORMAT:
"${request.artStyle} anime art. [Character description]: [age], [appearance], [clothing], showing [emotion/expression], [specific action/pose]. SETTING: [detailed environment] with ${request.mood} atmosphere. LIGHTING: [specific lighting that enhances mood]. CAMERA: [shot type and angle]. High quality anime illustration with vibrant colors and detailed backgrounds."

STORY STRUCTURE FOR ${scenesCount} SCENES:

${this.generateStoryStructure(scenesCount, request.story)}

FINAL REQUIREMENTS:
- Every scene must directly serve the user's original story concept
- Maintain visual and emotional continuity
- Create satisfying progression from start to finish
- End with appropriate resolution for the user's story
- Make it feel like a complete, cohesive narrative

Focus on QUALITY over complexity. Make every scene count toward telling the user's story effectively.

Now create the ${scenesCount} scenes that bring the user's story to life:
`;
  }

  private generateStoryStructure(scenesCount: number, userStory: string): string {
    const act1End = Math.ceil(scenesCount * 0.25);
    const act2End = Math.ceil(scenesCount * 0.75);
    
    return `
STRUCTURE YOUR SCENES:

ACT 1 (Scenes 1-${act1End}): SETUP
- Introduce the world and main character(s) from the user's story
- Establish the situation described in: "${userStory}"
- Set the tone and mood

ACT 2 (Scenes ${act1End + 1}-${act2End}): DEVELOPMENT
- Develop the main conflict or journey from the user's story
- Show character actions and reactions
- Build toward the climax the user's story implies

ACT 3 (Scenes ${act2End + 1}-${scenesCount}): RESOLUTION
- Resolve the conflict/situation from the user's story
- Show the outcome and any character growth
- Provide satisfying conclusion that matches the user's intent
`;
  }

  private parseStoryResponse(content: string, request: StoryGenerationRequest): GeneratedScene[] {
    console.log('Raw AI response:', content);
    
    try {
      // Try to extract JSON from the response
      let jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        // Try to find JSON between code blocks
        jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }
      
      if (!jsonMatch) {
        console.error('No JSON found in response, using fallback');
        return this.createFallbackScenes(request);
      }

      let scenes;
      try {
        scenes = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Try to clean the JSON
        const cleanedJson = this.cleanJsonString(jsonMatch[0]);
        scenes = JSON.parse(cleanedJson);
      }
      
      console.log('Parsed scenes:', scenes);
      
      if (!Array.isArray(scenes)) {
        console.error('Response is not an array');
        return this.createFallbackScenes(request);
      }
      
      // Validate and process scenes
      const processedScenes = scenes.map((scene: any, index: number) => {
        return {
          timestamp: index,
          scene: index + 1,
          description: scene.description || `Scene ${index + 1}: Continuing the story`,
          dialogue: scene.dialogue || undefined,
          characters: Array.isArray(scene.characters) ? scene.characters : 
                     (scene.characters ? [scene.characters] : ['Main Character']),
          setting: scene.setting || request.setting || 'Story location',
          visualPrompt: scene.visualPrompt || this.generateFallbackVisualPrompt(scene, request, index)
        };
      });
      
      // Ensure we have the right number of scenes
      if (processedScenes.length !== request.duration) {
        console.warn(`Scene count mismatch: got ${processedScenes.length}, expected ${request.duration}`);
        return this.adjustSceneCount(processedScenes, request);
      }
      
      return processedScenes;
      
    } catch (error) {
      console.error('Error parsing story response:', error);
      console.error('Response content:', content);
      return this.createFallbackScenes(request);
    }
  }

  private cleanJsonString(jsonStr: string): string {
    // Remove any trailing commas before closing brackets/braces
    let cleaned = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix common quote issues
    cleaned = cleaned.replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    
    // Ensure proper string escaping
    cleaned = cleaned.replace(/\\"/g, '\\"');
    
    return cleaned;
  }

  private createFallbackScenes(request: StoryGenerationRequest): GeneratedScene[] {
    console.log('Creating fallback scenes for:', request.story);
    
    const scenes: GeneratedScene[] = [];
    const scenesCount = request.duration;
    
    for (let i = 0; i < scenesCount; i++) {
      const progress = i / (scenesCount - 1);
      let sceneType = '';
      let description = '';
      
      if (progress <= 0.25) {
        sceneType = 'Opening';
        description = `Setting up the story: ${request.story.substring(0, 50)}...`;
      } else if (progress <= 0.75) {
        sceneType = 'Development';
        description = `Continuing the story with rising action and character development`;
      } else {
        sceneType = 'Conclusion';
        description = `Resolving the story and showing the outcome`;
      }
      
      scenes.push({
        timestamp: i,
        scene: i + 1,
        description: `${sceneType}: ${description}`,
        characters: ['Main Character'],
        setting: request.setting,
        visualPrompt: this.generateFallbackVisualPrompt(null, request, i)
      });
    }
    
    return scenes;
  }

  private generateFallbackVisualPrompt(scene: any, request: StoryGenerationRequest, index: number): string {
    const basePrompt = `${request.artStyle} anime art style. `;
    const characterDesc = `Main character in ${request.setting} setting. `;
    const moodDesc = `${request.mood} atmosphere with appropriate lighting. `;
    const sceneDesc = scene?.description || `Scene ${index + 1} of the story: ${request.story}`;
    const technicalDesc = `High quality anime illustration, detailed background, vibrant colors, professional anime production quality.`;
    
    return basePrompt + characterDesc + moodDesc + sceneDesc + '. ' + technicalDesc;
  }

  private adjustSceneCount(scenes: GeneratedScene[], request: StoryGenerationRequest): GeneratedScene[] {
    const targetCount = request.duration;
    
    if (scenes.length < targetCount) {
      // Duplicate middle scenes to reach target count
      const additionalScenes = targetCount - scenes.length;
      const middleIndex = Math.floor(scenes.length / 2);
      
      for (let i = 0; i < additionalScenes; i++) {
        const templateScene = scenes[middleIndex];
        const newScene = {
          ...templateScene,
          timestamp: scenes.length + i,
          scene: scenes.length + i + 1,
          description: `Continued: ${templateScene.description}`
        };
        scenes.push(newScene);
      }
    } else if (scenes.length > targetCount) {
      // Trim to target count
      scenes = scenes.slice(0, targetCount);
    }
    
    // Re-index all scenes
    return scenes.map((scene, index) => ({
      ...scene,
      timestamp: index,
      scene: index + 1
    }));
  }
}
