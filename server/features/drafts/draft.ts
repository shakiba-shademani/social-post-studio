import type { SocialPlatformId } from '../platforms/social-platform.ts';

export interface Draft {
  id: string;
  platformId: SocialPlatformId;
  text: string;
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
}
