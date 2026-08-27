/** "Şu an müsaitim" can be turned on for a limited duration; once it lapses we
 * treat it as off everywhere it's read, without needing a background job. */
export function isAvailableNowEffective(business: {
  availableNow: boolean;
  availableNowUntil: Date | null;
}): boolean {
  if (!business.availableNow) return false;
  if (!business.availableNowUntil) return true;
  return business.availableNowUntil.getTime() > Date.now();
}
