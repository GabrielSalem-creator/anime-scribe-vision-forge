
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Eye, EyeOff } from 'lucide-react';

interface ApiKeyFormProps {
  onApiKeysSubmit: (aiKey: string, imageKey: string) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeysSubmit }) => {
  const [aiApiKey, setAiApiKey] = useState('');
  const [imageApiKey, setImageApiKey] = useState('');
  const [showAiKey, setShowAiKey] = useState(false);
  const [showImageKey, setShowImageKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiApiKey.trim() && imageApiKey.trim()) {
      onApiKeysSubmit(aiApiKey.trim(), imageApiKey.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-fit">
            <Key className="h-8 w-8 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            API Configuration
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Enter your API keys to start creating anime stories
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <AlertDescription className="text-blue-300 text-sm">
                Your API keys are stored locally and never sent to our servers. You can get your OpenRouter AI key from{' '}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">
                  openrouter.ai
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="aiApiKey" className="text-purple-300">
                OpenRouter AI API Key
              </Label>
              <div className="relative">
                <Input
                  id="aiApiKey"
                  type={showAiKey ? "text" : "password"}
                  placeholder="sk-or-v1-..."
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-slate-100 placeholder:text-slate-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAiKey(!showAiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageApiKey" className="text-purple-300">
                Image Generation API Key
              </Label>
              <div className="relative">
                <Input
                  id="imageApiKey"
                  type={showImageKey ? "text" : "password"}
                  placeholder="Your image generation API key..."
                  value={imageApiKey}
                  onChange={(e) => setImageApiKey(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30 text-slate-100 placeholder:text-slate-400 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowImageKey(!showImageKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showImageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
              disabled={!aiApiKey.trim() || !imageApiKey.trim()}
            >
              Start Creating
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyForm;
