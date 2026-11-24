// Keep existing IDs stable when adding platforms.
export const SocialPlatform = Object.freeze({
  INSTAGRAM: 1,
  LINKEDIN: 2,
  X: 3,
  FACEBOOK: 4,
} as const);

export type SocialPlatformId = (typeof SocialPlatform)[keyof typeof SocialPlatform];

const platformIds: ReadonlySet<unknown> = new Set(Object.values(SocialPlatform));

export function isPlatformId(value: unknown): value is SocialPlatformId {
  return platformIds.has(value);
}
