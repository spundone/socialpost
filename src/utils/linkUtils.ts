import { SocialMediaPlatform } from '../types';

interface TrackingParams {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
}

const PLATFORM_CONFIGS: Record<SocialMediaPlatform, {
  baseUrl: string;
  defaultParams: TrackingParams;
}> = {
  twitter: {
    baseUrl: 'https://twitter.com',
    defaultParams: {
      source: 'twitter',
      medium: 'social',
      campaign: 'organic'
    }
  },
  linkedin: {
    baseUrl: 'https://linkedin.com',
    defaultParams: {
      source: 'linkedin',
      medium: 'social',
      campaign: 'organic'
    }
  },
  instagram: {
    baseUrl: 'https://instagram.com',
    defaultParams: {
      source: 'instagram',
      medium: 'social',
      campaign: 'organic'
    }
  }
};

export const generateTrackingLink = (
  url: string,
  platform: SocialMediaPlatform,
  customParams?: Partial<TrackingParams>
): string => {
  const config = PLATFORM_CONFIGS[platform];
  const params = { ...config.defaultParams, ...customParams };
  
  const utmParams = new URLSearchParams({
    utm_source: params.source,
    utm_medium: params.medium,
    utm_campaign: params.campaign,
    ...(params.content && { utm_content: params.content })
  });

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${utmParams.toString()}`;
};

export const generateProfileUrl = (
  platform: SocialMediaPlatform,
  username: string
): string => {
  const config = PLATFORM_CONFIGS[platform];
  return `${config.baseUrl}/${username}`;
};

export const extractUsername = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[0] || '';
  } catch {
    return url.replace(/^@/, '');
  }
}; 