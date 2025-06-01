
export class VideoService {
  async createVideoFromImages(
    scenes: Array<{ imageUrl: string; timestamp: number }>, 
    totalFrames: number,
    playbackDuration: number
  ): Promise<string> {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions (16:9 aspect ratio)
      canvas.width = 1280;
      canvas.height = 720;

      // Create MediaRecorder to record the canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      
      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          resolve(videoUrl);
        };

        mediaRecorder.onerror = (error) => {
          reject(error);
        };

        // Start recording
        mediaRecorder.start();

        // Animate through all scenes
        this.animateScenes(ctx, canvas, scenes, totalFrames, playbackDuration).then(() => {
          mediaRecorder.stop();
        }).catch(reject);
      });
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error('Failed to create video');
    }
  }

  private async animateScenes(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    scenes: Array<{ imageUrl: string; timestamp: number }>,
    totalFrames: number,
    playbackDuration: number
  ): Promise<void> {
    const frameDuration = 1000 / 30; // 30 FPS
    const framesPerScene = Math.ceil(totalFrames / scenes.length);
    const sceneDuration = (playbackDuration * 1000) / scenes.length; // Duration per scene in ms

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      try {
        // Load the image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl;
        });

        // Animate this scene for the calculated duration
        const actualFrames = Math.ceil(sceneDuration / frameDuration);
        for (let frame = 0; frame < actualFrames; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image with fade-in effect
          const fadeProgress = Math.min(frame / (actualFrames * 0.1), 1); // 10% fade-in
          ctx.globalAlpha = fadeProgress;
          
          // Calculate aspect ratio and draw image to fit canvas
          const aspectRatio = img.width / img.height;
          const canvasAspectRatio = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (aspectRatio > canvasAspectRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / aspectRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * aspectRatio;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          }
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          // Add scene number overlay
          ctx.globalAlpha = 1;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, 10, 120, 40);
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px Arial';
          ctx.fillText(`Scene ${i + 1}`, 20, 35);
          
          // Wait for next frame
          await new Promise(resolve => setTimeout(resolve, frameDuration));
        }
      } catch (error) {
        console.error(`Error processing scene ${i + 1}:`, error);
        // Draw error frame
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.fillText(`Error loading scene ${i + 1}`, 50, canvas.height / 2);
        
        await new Promise(resolve => setTimeout(resolve, sceneDuration));
      }
    }
  }

  downloadVideo(videoUrl: string, filename: string = 'anime-story.webm') {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
