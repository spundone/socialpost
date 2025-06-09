import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const PLATFORM_GUIDELINES = {
  twitter: {
    maxLength: 280,
    style: 'concise, engaging, and conversational',
    features: ['hashtags', 'mentions', 'thread support']
  },
  linkedin: {
    maxLength: 3000,
    style: 'professional, informative, and thought-provoking',
    features: ['industry insights', 'professional hashtags', 'call-to-action']
  },
  instagram: {
    maxLength: 2200,
    style: 'visual, engaging, and personal',
    features: ['emojis', 'relevant hashtags', 'storytelling']
  }
};

interface GeminiResponse {
  text: string;
  error?: string;
}

export const geminiService = {
  async generatePost(content: string, platform: 'twitter' | 'linkedin' | 'instagram', model: string = 'gemini-1.5-flash') {
    try {
      const modelInstance = genAI.getGenerativeModel({ model });
      const guidelines = PLATFORM_GUIDELINES[platform];
      
      const prompt = `You are a social media expert. Format this content for ${platform}:

Content: ${content}

Guidelines:
- Style: ${guidelines.style}
- Maximum length: ${guidelines.maxLength} characters
- Include: ${guidelines.features.join(', ')}
${platform === 'twitter' ? '- Split into a thread if needed (max 280 chars per tweet)\n- Add thread numbering (1/n)' : ''}

Format the content appropriately for ${platform} while maintaining the original message and tone.`;

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return { text, error: null };
    } catch (error) {
      console.error('Error generating post:', error);
      return { text: '', error: 'Failed to generate content' };
    }
  },

  async analyzeImage(image: File, model: string = 'gemini-1.5-pro-vision') {
    try {
      const modelInstance = genAI.getGenerativeModel({ model });
      
      // Convert File to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(image);
      });

      const prompt = `Analyze this image for social media posting:

1. Provide a detailed description of the image
2. Suggest an engaging caption
3. Recommend relevant hashtags
4. Identify the best platform(s) for posting (Twitter, LinkedIn, Instagram)
5. Suggest any improvements or edits needed

Format the response in a clear, structured way.`;

      const result = await modelInstance.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: image.type,
            data: base64Image
          }
        }
      ]);
      const response = await result.response;
      const text = response.text();
      
      return { text, error: null };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return { text: '', error: 'Failed to analyze image' };
    }
  }
}; 