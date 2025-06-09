import { PostContent, FormattedPost, SocialMediaAccount } from '../types';
import { geminiService } from '../services/geminiService';

export const formatContent = async (content: PostContent): Promise<FormattedPost[]> => {
  const formattedPosts: FormattedPost[] = [];

  for (const account of content.accounts) {
    try {
      // Generate platform-specific content using Gemini AI
      const response = await geminiService.generatePost(content.caption, account.platform);
      
      if (response.error) {
        console.error(`Error generating content for ${account.platform}:`, response.error);
        continue;
      }

      formattedPosts.push({
        platform: account.platform,
        content: response.text,
        username: account.username
      });
    } catch (error) {
      console.error(`Error formatting for ${account.platform}:`, error);
    }
  }

  return formattedPosts;
}; 