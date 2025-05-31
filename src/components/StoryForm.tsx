
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PlayCircle } from 'lucide-react';

interface StoryFormProps {
  onGenerateStory: (formData: StoryFormData) => void;
  isGenerating: boolean;
}

export interface StoryFormData {
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

const StoryForm: React.FC<StoryFormProps> = ({ onGenerateStory, isGenerating }) => {
  const [formData, setFormData] = useState<StoryFormData>({
    story: '',
    duration: 30,
    genre: 'action',
    artStyle: 'modern-anime',
    setting: 'urban',
    mood: 'dramatic',
    characterCount: 2,
    pacing: 'medium',
    specialEffects: 'moderate',
    cameraStyle: 'dynamic'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateStory(formData);
  };

  const updateFormData = (key: keyof StoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/20 shadow-2xl">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Anime Story Creator
        </CardTitle>
        <p className="text-slate-300 mt-2">Transform your story into a stunning anime sequence</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="story" className="text-lg font-semibold text-purple-300">
              Your Anime Story
            </Label>
            <Textarea
              id="story"
              placeholder="Enter your anime story here... (e.g., 'A young warrior discovers they have magical powers and must save their village from an ancient demon')"
              value={formData.story}
              onChange={(e) => updateFormData('story', e.target.value)}
              className="min-h-32 bg-slate-800/50 border-purple-500/30 text-slate-100 placeholder:text-slate-400 focus:border-purple-400"
              required
            />
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600">Basic Settings</TabsTrigger>
              <TabsTrigger value="visual" className="data-[state=active]:bg-purple-600">Visual Style</TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-purple-300">Duration (seconds)</Label>
                  <div className="px-4">
                    <Slider
                      value={[formData.duration]}
                      onValueChange={(value) => updateFormData('duration', value[0])}
                      max={180}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400 mt-1">
                      <span>10s</span>
                      <span className="font-semibold text-purple-300">{formData.duration}s</span>
                      <span>180s</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Genre</Label>
                  <Select value={formData.genre} onValueChange={(value) => updateFormData('genre', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="slice-of-life">Slice of Life</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-purple-300">Art Style</Label>
                  <Select value={formData.artStyle} onValueChange={(value) => updateFormData('artStyle', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern-anime">Modern Anime</SelectItem>
                      <SelectItem value="classic-anime">Classic Anime</SelectItem>
                      <SelectItem value="studio-ghibli">Studio Ghibli Style</SelectItem>
                      <SelectItem value="manga">Manga Style</SelectItem>
                      <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Setting</Label>
                  <Select value={formData.setting} onValueChange={(value) => updateFormData('setting', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urban">Urban/City</SelectItem>
                      <SelectItem value="rural">Rural/Countryside</SelectItem>
                      <SelectItem value="fantasy">Fantasy World</SelectItem>
                      <SelectItem value="futuristic">Futuristic</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="supernatural">Supernatural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Mood</Label>
                  <Select value={formData.mood} onValueChange={(value) => updateFormData('mood', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                      <SelectItem value="cheerful">Cheerful</SelectItem>
                      <SelectItem value="mysterious">Mysterious</SelectItem>
                      <SelectItem value="intense">Intense</SelectItem>
                      <SelectItem value="peaceful">Peaceful</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Character Count</Label>
                  <div className="px-4">
                    <Slider
                      value={[formData.characterCount]}
                      onValueChange={(value) => updateFormData('characterCount', value[0])}
                      max={6}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400 mt-1">
                      <span>1</span>
                      <span className="font-semibold text-purple-300">{formData.characterCount} characters</span>
                      <span>6</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-purple-300">Pacing</Label>
                  <Select value={formData.pacing} onValueChange={(value) => updateFormData('pacing', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow & Contemplative</SelectItem>
                      <SelectItem value="medium">Medium Paced</SelectItem>
                      <SelectItem value="fast">Fast & Action-Packed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Special Effects</Label>
                  <Select value={formData.specialEffects} onValueChange={(value) => updateFormData('specialEffects', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Camera Style</Label>
                  <Select value={formData.cameraStyle} onValueChange={(value) => updateFormData('cameraStyle', value)}>
                    <SelectTrigger className="bg-slate-800/50 border-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static Shots</SelectItem>
                      <SelectItem value="dynamic">Dynamic Movement</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.story.trim() || isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Your Anime...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-5 w-5" />
                <span>Generate Anime Story</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StoryForm;
