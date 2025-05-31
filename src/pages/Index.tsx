
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StoryForm, { type StoryFormData } from '@/components/StoryForm';
import StoryOutput, { type StoryScene } from '@/components/StoryOutput';
import ApiKeyForm from '@/components/ApiKeyForm';
import { AIService } from '@/services/aiService';
import { ImageService } from '@/services/imageService';

const Index = () => {
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [imageService, setImageService] = useState<ImageService | null>(null);
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  // Check for stored API keys on component mount
  useEffect(() => {
    const storedAiKey = localStorage.getItem('anime_ai_api_key');
    const storedImageKey = localStorage.getItem('anime_image_api_key');
    
    if (storedAiKey && storedImageKey) {
      setAiService(new AIService(storedAiKey));
      setImageService(new ImageService(storedImageKey));
    }
  }, []);

  const handleApiKeysSubmit = (aiKey: string, imageKey: string) => {
    // Store API keys in localStorage
    localStorage.setItem('anime_ai_api_key', aiKey);
    localStorage.setItem('anime_image_api_key', imageKey);
    
    setAiService(new AIService(aiKey));
    setImageService(new ImageService(imageKey));
    
    toast.success('API keys configured successfully!');
  };

  const handleGenerateStory = async (formData: StoryFormData) => {
    if (!aiService || !imageService) {
      toast.error('Please configure your API keys first');
      return;
    }

    setIsGenerating(true);
    setScenes([]);
    setTotalDuration(formData.duration);

    try {
      toast.loading('Generating story script...', { id: 'story-generation' });

      // Generate the story script
      const generatedScenes = await aiService.generateStoryScript(formData);
      
      // Convert to StoryScene format and set initial state
      const initialScenes: StoryScene[] = generatedScenes.map(scene => ({
        ...scene,
        isGenerating: true
      }));

      setScenes(initialScenes);
      toast.success('Story script generated! Now creating images...', { id: 'story-generation' });

      // Generate images for each scene
      const updatedScenes = [...initialScenes];
      
      for (let i = 0; i < generatedScenes.length; i++) {
        try {
          toast.loading(`Generating image ${i + 1} of ${generatedScenes.length}...`, { id: 'image-generation' });
          
          const imageUrl = await imageService.generateImage(generatedScenes[i].visualPrompt);
          
          updatedScenes[i] = {
            ...updatedScenes[i],
            imageUrl,
            isGenerating: false
          };
          
          setScenes([...updatedScenes]);
          
          // Small delay between image generations to avoid rate limiting
          if (i < generatedScenes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error generating image for scene ${i + 1}:`, error);
          updatedScenes[i] = {
            ...updatedScenes[i],
            isGenerating: false
          };
          setScenes([...updatedScenes]);
          toast.error(`Failed to generate image for scene ${i + 1}`);
        }
      }

      toast.success('Anime story creation complete!', { id: 'image-generation' });
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to generate story. Please try again.', { id: 'story-generation' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Show API key form if services are not configured
  if (!aiService || !imageService) {
    return <ApiKeyForm onApiKeysSubmit={handleApiKeysSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Anime Story Creator
          </h1>
          <p className="text-xl text-slate-300">
            Transform your stories into stunning anime sequences with AI
          </p>
        </div>

        <StoryForm onGenerateStory={handleGenerateStory} isGenerating={isGenerating} />
        
        {scenes.length > 0 && (
          <StoryOutput scenes={scenes} totalDuration={totalDuration} />
        )}
      </div>
    </div>
  );
};

export default Index;
