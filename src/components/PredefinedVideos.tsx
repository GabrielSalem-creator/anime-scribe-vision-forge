
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface PredefinedVideo {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  thumbnail: string;
  story: string;
  optimizedSettings: {
    artStyle: string;
    setting: string;
    mood: string;
    characterCount: number;
    pacing: string;
    specialEffects: string;
    cameraStyle: string;
  };
}

const predefinedVideos: PredefinedVideo[] = [
  {
    id: 'ninja-adventure',
    title: 'Ninja Shadow Strike',
    description: 'Epic ninja battle in moonlit bamboo forest',
    genre: 'Action',
    duration: 10,
    thumbnail: '🥷',
    story: 'A skilled ninja infiltrates an enemy compound under the cover of darkness, engaging in swift combat with shadowy adversaries while leaping through bamboo groves and ancient temples.',
    optimizedSettings: {
      artStyle: 'Dark anime with sharp contrasts',
      setting: 'Ancient Japanese temple complex at night',
      mood: 'Intense and mysterious',
      characterCount: 3,
      pacing: 'Fast-paced with dynamic action',
      specialEffects: 'Shadow techniques and moonlight effects',
      cameraStyle: 'Dynamic tracking shots with close-ups'
    }
  },
  {
    id: 'magical-girl',
    title: 'Starlight Guardian',
    description: 'Magical girl transformation and monster battle',
    genre: 'Fantasy',
    duration: 12,
    thumbnail: '⭐',
    story: 'A young girl discovers her magical powers and transforms into a starlight guardian to protect her city from an otherworldly monster threatening innocent civilians.',
    optimizedSettings: {
      artStyle: 'Bright magical girl anime style',
      setting: 'Modern city at sunset with magical effects',
      mood: 'Heroic and inspiring',
      characterCount: 2,
      pacing: 'Dramatic with transformation sequence',
      specialEffects: 'Sparkling magic and energy beams',
      cameraStyle: 'Spinning transformation shots and wide battle scenes'
    }
  },
  {
    id: 'mecha-battle',
    title: 'Steel Titan Clash',
    description: 'Giant robots battling in futuristic cityscape',
    genre: 'Mecha',
    duration: 15,
    thumbnail: '🤖',
    story: 'Two massive mechas engage in an epic battle across a futuristic metropolis, with the pilot of the blue mecha fighting to protect the city from the destructive red invader.',
    optimizedSettings: {
      artStyle: 'Detailed mecha anime with metallic textures',
      setting: 'Futuristic city with towering skyscrapers',
      mood: 'Epic and intense',
      characterCount: 2,
      pacing: 'Explosive action with strategic moments',
      specialEffects: 'Energy weapons and explosion effects',
      cameraStyle: 'Wide shots showing scale with dramatic angles'
    }
  },
  {
    id: 'school-romance',
    title: 'Cherry Blossom Confession',
    description: 'Sweet high school romance under sakura trees',
    genre: 'Romance',
    duration: 8,
    thumbnail: '🌸',
    story: 'A shy student finally gathers courage to confess their feelings to their crush under the beautiful cherry blossom trees during the school festival.',
    optimizedSettings: {
      artStyle: 'Soft shoujo anime style with pastel colors',
      setting: 'Japanese high school during cherry blossom season',
      mood: 'Romantic and tender',
      characterCount: 2,
      pacing: 'Gentle and emotional',
      specialEffects: 'Falling cherry blossoms and soft lighting',
      cameraStyle: 'Close-ups and romantic angles'
    }
  },
  {
    id: 'space-adventure',
    title: 'Cosmic Explorer',
    description: 'Space adventure with alien encounters',
    genre: 'Sci-Fi',
    duration: 14,
    thumbnail: '🚀',
    story: 'A brave space explorer discovers a mysterious alien artifact on a distant planet and must escape hostile alien forces while protecting the ancient relic.',
    optimizedSettings: {
      artStyle: 'Detailed sci-fi anime with cosmic effects',
      setting: 'Alien planet with strange landscapes and space stations',
      mood: 'Adventurous and mysterious',
      characterCount: 4,
      pacing: 'Fast-paced exploration and escape',
      specialEffects: 'Laser weapons and alien technology',
      cameraStyle: 'Wide cosmic shots and action sequences'
    }
  }
];

interface PredefinedVideosProps {
  onGenerateVideo: (video: PredefinedVideo) => void;
  isGenerating: boolean;
}

const PredefinedVideos: React.FC<PredefinedVideosProps> = ({ onGenerateVideo, isGenerating }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Predefined Anime Videos
        </h2>
        <p className="text-slate-300">
          Choose from optimized prompts for ultra-fast generation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predefinedVideos.map((video) => (
          <Card key={video.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="text-4xl mb-2">{video.thumbnail}</div>
                <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {video.genre}
                </Badge>
              </div>
              <CardTitle className="text-lg text-purple-300">{video.title}</CardTitle>
              <p className="text-sm text-slate-400">{video.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(video.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span>{video.duration} scenes</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-slate-500 line-clamp-3">{video.story}</p>
              </div>
              
              <Button
                onClick={() => onGenerateVideo(video)}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Generate Video</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PredefinedVideos;
