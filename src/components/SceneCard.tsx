
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, Users, Camera, Palette, ChevronDown, ChevronUp, Minimize, Maximize } from 'lucide-react';
import { StoryScene } from './StoryOutput';

interface SceneCardProps {
  scene: StoryScene;
  index: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageMinimized, setIsImageMinimized] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-300">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-300 hover:text-purple-200"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
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

            {isExpanded && scene.dialogue && (
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Dialogue</h4>
                <div className="bg-slate-900/50 p-3 rounded-lg border-l-4 border-purple-500">
                  <p className="text-slate-300 italic">"{scene.dialogue}"</p>
                </div>
              </div>
            )}

            {isExpanded && (
              <>
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
              </>
            )}
          </div>

          <div className="space-y-4">
            {isExpanded && (
              <div>
                <h4 className="font-semibold text-purple-300 mb-2 flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>Visual Prompt</span>
                </h4>
                <ScrollArea className="h-48">
                  <p className="text-slate-400 text-sm leading-relaxed pr-4">{scene.visualPrompt}</p>
                </ScrollArea>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-300 text-sm">Generated Image</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageMinimized(!isImageMinimized)}
                  className="text-purple-300 hover:text-purple-200 h-6 w-6 p-0"
                >
                  {isImageMinimized ? <Maximize className="h-3 w-3" /> : <Minimize className="h-3 w-3" />}
                </Button>
              </div>
              
              {!isImageMinimized && (
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
                      <p className="text-slate-500 text-sm">Image failed to generate</p>
                    </div>
                  )}
                </div>
              )}
              
              {isImageMinimized && (
                <div className="h-12 bg-slate-900/50 rounded-lg border border-purple-500/30 flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Image minimized - click to expand</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SceneCard;
