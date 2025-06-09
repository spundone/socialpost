import { PostContent, FormattedPost } from '../types';

const TWITTER_MAX_LENGTH = 280;
const INSTAGRAM_MAX_LENGTH = 2200;
const LINKEDIN_MAX_LENGTH = 3000;

export const formatForTwitter = (content: PostContent): FormattedPost => {
  const { caption, image } = content;
  let formattedContent = caption;

  // Split into threads if needed
  if (caption.length > TWITTER_MAX_LENGTH) {
    const chunks = [];
    let remainingText = caption;
    
    while (remainingText.length > 0) {
      const chunk = remainingText.slice(0, TWITTER_MAX_LENGTH);
      chunks.push(chunk);
      remainingText = remainingText.slice(TWITTER_MAX_LENGTH);
    }
    
    formattedContent = chunks.map((chunk, index) => 
      `${chunk} (${index + 1}/${chunks.length})`
    ).join('\n\n');
  }

  return {
    platform: 'twitter',
    content: formattedContent,
    image
  };
};

export const formatForLinkedIn = (content: PostContent): FormattedPost => {
  const { caption, image, referencePost } = content;
  let formattedContent = caption;

  if (referencePost) {
    formattedContent += `\n\nReference: ${referencePost}`;
  }

  return {
    platform: 'linkedin',
    content: formattedContent,
    image
  };
};

export const formatForInstagram = (content: PostContent): FormattedPost => {
  const { caption, image } = content;
  let formattedContent = caption;

  // Add hashtags if needed
  if (!caption.includes('#')) {
    formattedContent += '\n\n#socialmedia #content';
  }

  return {
    platform: 'instagram',
    content: formattedContent,
    image
  };
};

export const formatContent = (content: PostContent): FormattedPost[] => {
  return [
    formatForTwitter(content),
    formatForLinkedIn(content),
    formatForInstagram(content)
  ];
}; 