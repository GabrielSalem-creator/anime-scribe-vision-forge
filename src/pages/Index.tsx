
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StoryForm, { type StoryFormData } from '@/components/StoryForm';
import StoryOutput, { type StoryScene } from '@/components/StoryOutput';
import { AIService } from '@/services/aiService';
import { ImageService } from '@/services/imageService';

const Index = () => {
  const [aiService] = useState<AIService>(new AIService('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'));
  const [imageService] = useState<ImageService>(new ImageService('2bc2e102900c03cec5304485acd19100c4984d821a3f1e5078f747578834f849'));
  const [scenes, setScenes] = useState<StoryScene[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);

  const handleGenerateStory = async (formData: StoryFormData) => {
    setIsGenerating(true);
    setScenes([]);
    setTotalDuration(formData.duration);

    try {
      toast.loading('Generating detailed story script...', { id: 'story-generation' });

      // Generate the story script (1 scene per second)
      const generatedScenes = await aiService.generateStoryScript(formData);
      
      // Convert to StoryScene format and set initial state
      const initialScenes: StoryScene[] = generatedScenes.map(scene => ({
        ...scene,
        isGenerating: true
      }));

      setScenes(initialScenes);
      toast.success('Story script generated! Now creating detailed images...', { id: 'story-generation' });

      // Generate images for each scene
      const updatedScenes = [...initialScenes];
      
      for (let i = 0; i < generatedScenes.length; i++) {
        try {
          toast.loading(`Generating detailed image ${i + 1} of ${generatedScenes.length}...`, { id: 'image-generation' });
          
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

      toast.success('Anime story creation complete! You can now create a video with custom timing.', { id: 'image-generation' });
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to generate story. Please try again.', { id: 'story-generation' });
    } finally {
      setIsGenerating(false);
    }
  };

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
