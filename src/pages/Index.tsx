
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StoryForm, { type StoryFormData } from '@/components/StoryForm';
import StoryOutput, { type StoryScene } from '@/components/StoryOutput';
import { AIService } from '@/services/aiService';
import { ImageService } from '@/services/imageService';

const Index = () => {
  const [aiService] = useState<AIService>(new AIService('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'));
  
  // Multiple API keys for faster image generation
  const imageApiKeys = [
    'f681daf078ee9479dde6b6b2adf6de31daac782a8d8d218938bdf1c1e977f46a',
    'a8bae46ba72b6b68b1ea65102e86f24ca9abbd65f72e958a3cadaccb2b6df2a7',
    '6ca8a3346c5e32f8504e4d898d863392ce50d59ee7f7392f1b174d2d4bd6bc9f',
    '75afebc8c99419cc03856f276f428a357211260305461244be4c612b469d4811'
  ];
  
  const [imageService] = useState<ImageService>(new ImageService(imageApiKeys));
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
      toast.success('Story script generated! Now creating detailed images using parallel processing...', { id: 'story-generation' });

      // Generate all images in parallel using multiple API keys
      const prompts = generatedScenes.map(scene => scene.visualPrompt);
      
      toast.loading('Generating all images in parallel for faster processing...', { id: 'image-generation' });
      
      try {
        const imageResults = await imageService.generateImagesParallel(prompts);
        
        // Update scenes with generated images
        const updatedScenes = generatedScenes.map((scene, index) => ({
          ...scene,
          imageUrl: imageResults[index] || undefined,
          isGenerating: false
        }));
        
        setScenes(updatedScenes);
        
        const successCount = imageResults.filter(result => result !== null).length;
        toast.success(`Anime story creation complete! Generated ${successCount}/${generatedScenes.length} images successfully.`, { id: 'image-generation' });
        
      } catch (error) {
        console.error('Error in parallel image generation:', error);
        toast.error('Some images failed to generate. Please try again.', { id: 'image-generation' });
        
        // Mark all scenes as not generating
        const updatedScenes = generatedScenes.map(scene => ({
          ...scene,
          isGenerating: false
        }));
        setScenes(updatedScenes);
      }

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
