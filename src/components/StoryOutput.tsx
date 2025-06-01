
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
  const [totalFrames, setTotalFrames] = useState('30');
  const [fps, setFps] = useState('30');
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
      const frames = parseInt(totalFrames);
      const frameRate = parseInt(fps);
      
      const scenesWithImages = scenes
        .filter(scene => scene.imageUrl)
        .map(scene => ({
          imageUrl: scene.imageUrl!,
          timestamp: scene.timestamp
        }));

      const videoUrl = await videoService.createVideoFromImages(scenesWithImages, frames, frameRate);
      
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

  const calculatedDuration = parseInt(totalFrames) / parseInt(fps);

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
                <Camera className="h-4 w-4" />
                <span>{scenes.length} scenes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{calculatedDuration.toFixed(1)}s video</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">Total frames:</span>
                <Select value={totalFrames} onValueChange={setTotalFrames}>
                  <SelectTrigger className="w-20 bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="180">180</SelectItem>
                    <SelectItem value="240">240</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300">FPS:</span>
                <Select value={fps} onValueChange={setFps}>
                  <SelectTrigger className="w-16 bg-slate-800 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
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
