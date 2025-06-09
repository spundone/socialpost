export interface SocialMediaAccount {
  platform: 'twitter' | 'linkedin' | 'instagram';
  username: string;
}

export interface PostContent {
  image: File | null;
  caption: string;
  accounts: SocialMediaAccount[];
  referencePost?: string;
}

export interface FormattedPost {
  platform: 'twitter' | 'linkedin' | 'instagram';
  content: string;
  image?: File;
} 