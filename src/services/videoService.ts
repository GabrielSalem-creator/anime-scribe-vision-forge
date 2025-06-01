
export class VideoService {
  async createVideoFromImages(
    scenes: Array<{ imageUrl: string; timestamp: number }>, 
    totalFrames: number,
    fps: number
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
      const stream = canvas.captureStream(fps);
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
        this.animateScenes(ctx, canvas, scenes, totalFrames, fps).then(() => {
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
    fps: number
  ): Promise<void> {
    const frameDuration = 1000 / fps;
    const framesPerScene = Math.floor(totalFrames / scenes.length);
    const remainderFrames = totalFrames % scenes.length;

    let currentFrame = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      
      // Distribute remainder frames among first scenes
      const sceneFrames = framesPerScene + (i < remainderFrames ? 1 : 0);
      
      try {
        // Load the image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = scene.imageUrl;
        });

        // Animate this scene for the calculated frames
        for (let frame = 0; frame < sceneFrames; frame++) {
          // Clear canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image with fade-in effect
          const fadeProgress = Math.min(frame / (sceneFrames * 0.1), 1); // 10% fade-in
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
          
          // Add frame counter
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(canvas.width - 100, 10, 90, 40);
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.fillText(`${currentFrame + 1}/${totalFrames}`, canvas.width - 95, 35);
          
          currentFrame++;
          
          // Wait for next frame
          await new Promise(resolve => setTimeout(resolve, frameDuration));
        }
      } catch (error) {
        console.error(`Error processing scene ${i + 1}:`, error);
        // Draw error frame for the allocated frames
        for (let frame = 0; frame < sceneFrames; frame++) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '30px Arial';
          ctx.fillText(`Error loading scene ${i + 1}`, 50, canvas.height / 2);
          
          currentFrame++;
          await new Promise(resolve => setTimeout(resolve, frameDuration));
        }
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
