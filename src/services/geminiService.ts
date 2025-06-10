import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const PLATFORM_GUIDELINES = {
  twitter: {
    maxLength: 280,
    style: 'casual, conversational, and engaging with a personal touch',
    features: ['relevant hashtags', 'mentions', 'thread support', 'emojis when appropriate'],
    tone: 'friendly and authentic, like talking to a friend'
  },
  linkedin: {
    maxLength: 3000,
    style: 'professional yet personal, thought-provoking, and value-driven',
    features: ['industry insights', 'professional hashtags', 'call-to-action', 'personal anecdotes'],
    tone: 'authentic and professional, sharing real experiences'
  },
  instagram: {
    maxLength: 2200,
    style: 'visual storytelling, personal, and engaging',
    features: ['emojis', 'relevant hashtags', 'storytelling', 'personal touch'],
    tone: 'authentic and relatable, like sharing with friends'
  }
};

interface GeminiResponse {
  text: string;
  error?: string;
  prompt?: string;
}

export const geminiService = {
  isAvailable() {
    return !!genAI;
  },

  async generatePost(
    content: string, 
    platform: 'twitter' | 'linkedin' | 'instagram', 
    model: string = 'gemini-1.5-flash',
    context?: {
      caption?: string;
      referencePost?: string;
      socialHandles?: { platform: string; username: string }[];
    }
  ): Promise<GeminiResponse> {
    if (!genAI) {
      const guidelines = PLATFORM_GUIDELINES[platform];
      const prompt = `You are a social media expert. Create a natural, human-like post for ${platform} that matches the style and tone of the reference post if provided.

Content to adapt: ${content}

Platform Guidelines:
- Style: ${guidelines.style}
- Tone: ${guidelines.tone}
- Maximum length: ${guidelines.maxLength} characters
- Include: ${guidelines.features.join(', ')}
${platform === 'twitter' ? '- Split into a thread if needed (max 280 chars per tweet)\n- Add thread numbering (1/n)' : ''}

Additional Context:
${context?.caption ? `Caption: ${context.caption}\n` : ''}
${context?.referencePost ? `Reference Post Style: ${context.referencePost}\n` : ''}
${context?.socialHandles?.length ? `Social Handles:\n${context.socialHandles.map(h => `- ${h.platform}: @${h.username}`).join('\n')}\n` : ''}

Instructions:
1. Analyze the reference post's style and tone if provided
2. Match the writing style, emoji usage, and formatting of the reference post
3. Keep the same level of formality and personal touch
4. Use similar sentence structures and paragraph breaks
5. Maintain the original message while making it sound natural and authentic
6. Add appropriate hashtags and mentions based on the platform
7. Ensure the post feels like it's coming from a real person, not an AI

Format the content to sound like a natural social media post while maintaining the original message and matching the reference post's style.`;

      return { text: '', prompt };
    }

    try {
      const modelInstance = genAI.getGenerativeModel({ model });
      const guidelines = PLATFORM_GUIDELINES[platform];
      
      const prompt = `You are a social media expert. Create a natural, human-like post for ${platform} that matches the style and tone of the reference post if provided.

Content to adapt: ${content}

Platform Guidelines:
- Style: ${guidelines.style}
- Tone: ${guidelines.tone}
- Maximum length: ${guidelines.maxLength} characters
- Include: ${guidelines.features.join(', ')}
${platform === 'twitter' ? '- Split into a thread if needed (max 280 chars per tweet)\n- Add thread numbering (1/n)' : ''}

Additional Context:
${context?.caption ? `Caption: ${context.caption}\n` : ''}
${context?.referencePost ? `Reference Post Style: ${context.referencePost}\n` : ''}
${context?.socialHandles?.length ? `Social Handles:\n${context.socialHandles.map(h => `- ${h.platform}: @${h.username}`).join('\n')}\n` : ''}

Instructions:
1. Analyze the reference post's style and tone if provided
2. Match the writing style, emoji usage, and formatting of the reference post
3. Keep the same level of formality and personal touch
4. Use similar sentence structures and paragraph breaks
5. Maintain the original message while making it sound natural and authentic
6. Add appropriate hashtags and mentions based on the platform
7. Ensure the post feels like it's coming from a real person, not an AI

Format the content to sound like a natural social media post while maintaining the original message and matching the reference post's style.`;

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return { text, prompt };
    } catch (error) {
      console.error('Error generating post:', error);
      return { text: '', error: 'Failed to generate content' };
    }
  },

  async analyzeImage(
    image: File, 
    model: string = 'gemini-1.5-pro-vision',
    context?: {
      caption?: string;
      referencePost?: string;
      socialHandles?: { platform: string; username: string }[];
    }
  ): Promise<GeminiResponse> {
    if (!genAI) {
      const prompt = `Analyze this image for social media posting:

1. Provide a detailed description of the image
2. Suggest an engaging caption
3. Recommend relevant hashtags
4. Identify the best platform(s) for posting (Twitter, LinkedIn, Instagram)
5. Suggest any improvements or edits needed

Additional Context:
${context?.caption ? `Caption: ${context.caption}\n` : ''}
${context?.referencePost ? `Reference Post: ${context.referencePost}\n` : ''}
${context?.socialHandles?.length ? `Social Handles:\n${context.socialHandles.map(h => `- ${h.platform}: @${h.username}`).join('\n')}\n` : ''}

Format the response in a clear, structured way.`;

      return { text: '', prompt };
    }

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

Additional Context:
${context?.caption ? `Caption: ${context.caption}\n` : ''}
${context?.referencePost ? `Reference Post: ${context.referencePost}\n` : ''}
${context?.socialHandles?.length ? `Social Handles:\n${context.socialHandles.map(h => `- ${h.platform}: @${h.username}`).join('\n')}\n` : ''}

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
      
      return { text, prompt };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return { text: '', error: 'Failed to analyze image' };
    }
  }
}; 