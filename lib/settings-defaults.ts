/** Client-safe defaults (no Node/fs). Keep in sync with lib/settings.ts */

export type SiteSettings = {
  allowPublicBlogSubmit: boolean
  enableHoroscope: boolean
  enableBirthChart: boolean
  /** Kundli calculation backends (credentials still required for hosted APIs) */
  enableProviderSwiss: boolean
  enableProviderProkerala: boolean
  enableProviderAstrologyApi: boolean
  enableProviderFreeAstroApi: boolean
}

export const DEFAULT_SETTINGS: SiteSettings = {
  allowPublicBlogSubmit: true,
  enableHoroscope: true,
  enableBirthChart: true,
  enableProviderSwiss: true,
  enableProviderProkerala: true,
  enableProviderAstrologyApi: true,
  enableProviderFreeAstroApi: true,
}
