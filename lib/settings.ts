import "server-only"
import fs from "fs"
import path from "path"
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings-defaults"

export type { SiteSettings }
export { DEFAULT_SETTINGS }

const DATA_FILE = path.join(process.cwd(), "data", "settings.json")

function mergeSettings(data: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    allowPublicBlogSubmit:
      typeof data?.allowPublicBlogSubmit === "boolean"
        ? data.allowPublicBlogSubmit
        : DEFAULT_SETTINGS.allowPublicBlogSubmit,
    enableHoroscope:
      typeof data?.enableHoroscope === "boolean"
        ? data.enableHoroscope
        : DEFAULT_SETTINGS.enableHoroscope,
    enableBirthChart:
      typeof data?.enableBirthChart === "boolean"
        ? data.enableBirthChart
        : DEFAULT_SETTINGS.enableBirthChart,
    enableProviderSwiss:
      typeof data?.enableProviderSwiss === "boolean"
        ? data.enableProviderSwiss
        : DEFAULT_SETTINGS.enableProviderSwiss,
    enableProviderProkerala:
      typeof data?.enableProviderProkerala === "boolean"
        ? data.enableProviderProkerala
        : DEFAULT_SETTINGS.enableProviderProkerala,
    enableProviderAstrologyApi:
      typeof data?.enableProviderAstrologyApi === "boolean"
        ? data.enableProviderAstrologyApi
        : DEFAULT_SETTINGS.enableProviderAstrologyApi,
    enableProviderFreeAstroApi:
      typeof data?.enableProviderFreeAstroApi === "boolean"
        ? data.enableProviderFreeAstroApi
        : DEFAULT_SETTINGS.enableProviderFreeAstroApi,
  }
}

async function ensureFile(): Promise<SiteSettings> {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8")
    return { ...DEFAULT_SETTINGS }
  }
  return getSettings()
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return ensureFile()
    }
    const content = await fs.promises.readFile(DATA_FILE, "utf-8")
    const data = JSON.parse(content) as Partial<SiteSettings>
    return mergeSettings(data)
  } catch (err) {
    console.error("[Settings] Failed reading settings.json:", err)
    return { ...DEFAULT_SETTINGS }
  }
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings()
  const next = mergeSettings({
    allowPublicBlogSubmit:
      typeof patch.allowPublicBlogSubmit === "boolean"
        ? patch.allowPublicBlogSubmit
        : current.allowPublicBlogSubmit,
    enableHoroscope:
      typeof patch.enableHoroscope === "boolean" ? patch.enableHoroscope : current.enableHoroscope,
    enableBirthChart:
      typeof patch.enableBirthChart === "boolean"
        ? patch.enableBirthChart
        : current.enableBirthChart,
    enableProviderSwiss:
      typeof patch.enableProviderSwiss === "boolean"
        ? patch.enableProviderSwiss
        : current.enableProviderSwiss,
    enableProviderProkerala:
      typeof patch.enableProviderProkerala === "boolean"
        ? patch.enableProviderProkerala
        : current.enableProviderProkerala,
    enableProviderAstrologyApi:
      typeof patch.enableProviderAstrologyApi === "boolean"
        ? patch.enableProviderAstrologyApi
        : current.enableProviderAstrologyApi,
    enableProviderFreeAstroApi:
      typeof patch.enableProviderFreeAstroApi === "boolean"
        ? patch.enableProviderFreeAstroApi
        : current.enableProviderFreeAstroApi,
  })
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf-8")
  return next
}
