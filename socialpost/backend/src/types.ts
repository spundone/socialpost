export interface FormattedPost {
  platform: 'twitter' | 'linkedin' | 'instagram';
  content: string;
}

export interface FormatRequest {
  markdown: string;
  platforms: ('twitter' | 'linkedin' | 'instagram')[];
}

export interface FormatResponse {
  posts: FormattedPost[];
} 