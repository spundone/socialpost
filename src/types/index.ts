export type SocialMediaPlatform = 'twitter' | 'linkedin' | 'instagram';

export interface SocialMediaAccount {
  platform: SocialMediaPlatform;
  username: string;
}

export interface PostContent {
  image: File | null;
  caption: string;
  accounts: SocialMediaAccount[];
  referencePost: string;
}

export interface FormattedPost {
  platform: SocialMediaPlatform;
  content: string;
  username: string;
} 