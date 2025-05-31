
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, Users, Camera, Palette, Download, Video } from 'lucide-react';
import { VideoService } from '@/services/videoService';
import { toast } from 'sonner';

export interface StoryScene {
  timestamp: number;
  scene: number;
  description: string;
  dialogue?: string;
  characters: string[];
  setting: string;
  visualPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

interface StoryOutputProps {
  scenes: StoryScene[];
  totalDuration: number;
}

const StoryOutput: React.FC<StoryOutputProps> = ({ scenes, totalDuration }) => {
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videoService] = useState(new VideoService());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allImagesGenerated = scenes.length > 0 && scenes.every(scene => scene.imageUrl && !scene.isGenerating);

  const handleCreateVideo = async () => {
    if (!allImagesGenerated) {
      toast.error('Please wait for all images to be generated first');
      return;
    }

    setIsCreatingVideo(true);
    toast.loading('Creating animated video...', { id: 'video-creation' });

    try {
      const scenesWithImages = scenes
        .filter(scene => scene.imageUrl)
        .map(scene => ({
          imageUrl: scene.imageUrl!,
          timestamp: scene.timestamp
        }));

      const videoUrl = await videoService.createVideoFromImages(scenesWithImages);
      
      toast.success('Video created successfully!', { id: 'video-creation' });
      
      // Auto-download the video
      videoService.downloadVideo(videoUrl, `anime-story-${Date.now()}.webm`);
      
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video. Please try again.', { id: 'video-creation' });
    } finally {
      setIsCreatingVideo(false);
    }
  };

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Generated Anime Story
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-slate-300">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(totalDuration)} total</span>
              </div>
              <div className="flex items-center space-x-1">
                <Camera className="h-4 w-4" />
                <span>{scenes.length} scenes</span>
              </div>
            </div>
            {allImagesGenerated && (
              <Button
                onClick={handleCreateVideo}
                disabled={isCreatingVideo}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isCreatingVideo ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Video...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <Download className="h-4 w-4" />
                    <span>Create & Download Video</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {scenes.map((scene, index) => (
          <Card key={index} className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                    Scene {scene.scene}
                  </Badge>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">{formatTime(scene.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span className="text-sm text-slate-400">{scene.characters.length}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Scene Description</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{scene.description}</p>
                  </div>

                  {scene.dialogue && (
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-2">Dialogue</h4>
                      <div className="bg-slate-900/50 p-3 rounded-lg border-l-4 border-purple-500">
                        <p className="text-slate-300 italic">"{scene.dialogue}"</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">Characters</h4>
                    <div className="flex flex-wrap gap-2">
                      {scene.characters.map((character, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-700 text-slate-300">
                          {character}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">Setting</h4>
                    <p className="text-slate-400">{scene.setting}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Visual Prompt</span>
                    </h4>
                    <ScrollArea className="h-32">
                      <p className="text-slate-400 text-sm leading-relaxed pr-4">{scene.visualPrompt}</p>
                    </ScrollArea>
                  </div>

                  <div className="aspect-video bg-slate-900/50 rounded-lg border-2 border-dashed border-purple-500/30 flex items-center justify-center">
                    {scene.isGenerating ? (
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                        <p className="text-slate-400 text-sm">Generating image...</p>
                      </div>
                    ) : scene.imageUrl ? (
                      <img
                        src={scene.imageUrl}
                        alt={`Scene ${scene.scene}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <Palette className="h-8 w-8 text-slate-600 mx-auto" />
                        <p className="text-slate-500 text-sm">Image pending</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StoryOutput;
