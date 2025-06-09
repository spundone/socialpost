import { FormattedPost } from '../types';

export class PostFormatter {
  private static readonly TWITTER_MAX_LENGTH = 280;
  private static readonly INSTAGRAM_MAX_LENGTH = 2200;
  private static readonly LINKEDIN_MAX_LENGTH = 3000;

  private static splitIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  private static formatTwitterThread(markdown: string): string[] {
    const chunks = this.splitIntoChunks(markdown, this.TWITTER_MAX_LENGTH - 20); // Reserve space for (n/n)
    return chunks.map((chunk, index) => {
      const threadNumber = `(${index + 1}/${chunks.length})`;
      return `${chunk}\n\n${threadNumber}`;
    });
  }

  private static formatLinkedInPost(markdown: string): string {
    // LinkedIn allows longer posts, so we can keep most of the formatting
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\n\n/g, '\n') // Remove double line breaks
      .trim();
  }

  private static formatInstagramPost(markdown: string): string {
    // Instagram has similar formatting to LinkedIn but with different length limits
    return this.formatLinkedInPost(markdown);
  }

  public static formatPost(markdown: string, platform: 'twitter' | 'linkedin' | 'instagram'): FormattedPost[] {
    switch (platform) {
      case 'twitter':
        const twitterThread = this.formatTwitterThread(markdown);
        return twitterThread.map((content, index) => ({
          platform: 'twitter',
          content: `Tweet ${index + 1}\n\n${content}`
        }));
      case 'linkedin':
        return [{
          platform: 'linkedin',
          content: this.formatLinkedInPost(markdown)
        }];
      case 'instagram':
        return [{
          platform: 'instagram',
          content: this.formatInstagramPost(markdown)
        }];
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
} 