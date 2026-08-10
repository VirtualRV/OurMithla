/**
 * AdSense configuration.
 *
 * Publisher ID is already set. Ad units only fill when you create real ad units
 * in AdSense and put their numeric slot IDs in env (see .env.example).
 *
 * Named keys used in the UI map to env vars:
 *   home-mid       → NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID
 *   home-sidebar   → NEXT_PUBLIC_ADSENSE_SLOT_HOME_SIDEBAR
 *   blog-inline    → NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INLINE
 *   blog-sidebar   → NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR
 *   panchang-mid   → NEXT_PUBLIC_ADSENSE_SLOT_PANCHANG_MID
 */

export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-3653662664461490"

const SLOT_ENV: Record<string, string | undefined> = {
  "home-mid": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID,
  "home-sidebar": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_SIDEBAR,
  "blog-inline": process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INLINE,
  "blog-sidebar": process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_SIDEBAR,
  "panchang-mid": process.env.NEXT_PUBLIC_ADSENSE_SLOT_PANCHANG_MID,
}

/** AdSense data-ad-slot values are numeric strings from the AdSense UI. */
export function isValidAdSlotId(slot: string | undefined | null): slot is string {
  return Boolean(slot && /^\d{6,}$/.test(slot.trim()))
}

/**
 * Resolve a UI slot key (or a raw numeric id) to a valid AdSense slot id.
 * Returns undefined when not configured — callers should show a placeholder.
 */
export function resolveAdSlotId(slotKeyOrId?: string): string | undefined {
  if (!slotKeyOrId) return undefined

  // Allow passing a raw numeric slot id directly.
  if (isValidAdSlotId(slotKeyOrId)) return slotKeyOrId.trim()

  const fromEnv = SLOT_ENV[slotKeyOrId]?.trim()
  return isValidAdSlotId(fromEnv) ? fromEnv : undefined
}

export function isAdSenseReady(slotKeyOrId?: string): boolean {
  return Boolean(ADSENSE_CLIENT && resolveAdSlotId(slotKeyOrId))
}
