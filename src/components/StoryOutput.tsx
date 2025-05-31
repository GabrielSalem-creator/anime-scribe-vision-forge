
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Camera, Download, Video } from 'lucide-react';
import { VideoService } from '@/services/videoService';
import { toast } from 'sonner';
import SceneCard from './SceneCard';

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
  const [imagesPerSecond, setImagesPerSecond] = useState('1');
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
      const sceneDuration = parseFloat(imagesPerSecond) * 1000; // Convert to milliseconds
      const scenesWithImages = scenes
        .filter(scene => scene.imageUrl)
        .map(scene => ({
          imageUrl: scene.imageUrl!,
          timestamp: scene.timestamp,
          duration: sceneDuration
        }));

      const videoUrl = await videoService.createVideoFromImages(scenesWithImages, sceneDuration);
      
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
          <div className="flex items-center justify-between flex-wrap gap-4">
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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">Seconds per image:</span>
                <Select value={imagesPerSecond} onValueChange={setImagesPerSecond}>
                  <SelectTrigger className="w-20 bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="0.5">0.5s</SelectItem>
                    <SelectItem value="1">1s</SelectItem>
                    <SelectItem value="1.5">1.5s</SelectItem>
                    <SelectItem value="2">2s</SelectItem>
                    <SelectItem value="3">3s</SelectItem>
                    <SelectItem value="4">4s</SelectItem>
                    <SelectItem value="5">5s</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {scenes.map((scene, index) => (
          <SceneCard key={index} scene={scene} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StoryOutput;
