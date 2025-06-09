import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

interface GeminiResponse {
  text: string;
  error?: string;
}

export const geminiService = {
  async generatePost(content: string, platform: 'twitter' | 'linkedin' | 'instagram'): Promise<GeminiResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Format the following content for ${platform}:
      
Content: ${content}

Please format it appropriately for ${platform} with the following guidelines:
${platform === 'twitter' ? '- Split into a thread if needed (max 280 chars per tweet)\n- Add thread numbering (1/n)\n- Keep it concise and engaging' : 
platform === 'linkedin' ? '- Professional tone\n- Include relevant hashtags\n- Format for readability' :
'- Engaging and visual language\n- Include relevant emojis\n- Format for Instagram\'s style'}

Format the content and return only the formatted text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return { 
        text: '',
        error: error instanceof Error ? error.message : 'Failed to generate content'
      };
    }
  },

  async analyzeImage(imageFile: File): Promise<GeminiResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(imageFile);
      });

      const prompt = `Analyze this image and suggest:
1. A relevant caption
2. Appropriate hashtags
3. Best platform to post (Twitter, LinkedIn, or Instagram)
4. Any improvements or edits needed

Please provide a detailed analysis.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Gemini AI Image Analysis Error:', error);
      return { 
        text: '',
        error: error instanceof Error ? error.message : 'Failed to analyze image'
      };
    }
  }
}; 