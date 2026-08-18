import type { Metadata } from "next"
import { SEO_KEYWORDS, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Mithila Panchang & Maithili Patra",
  description:
    "Daily Mithila Panchang with Maithili Patra — tithi, nakshatra, muhurat, and auspicious days for vivah, janeu, mundan, and Chhath across Darbhanga, Madhubani, and Janakpur.",
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${SITE_URL}/panchang` },
  openGraph: {
    title: "Mithila Panchang & Maithili Patra | OurMithla",
    description:
      "Read the full-month Maithili Patra and today's Panchang for Mithila — tithi, yoga, karana, and festival vrats.",
    url: `${SITE_URL}/panchang`,
  },
}

export default function PanchangLayout({ children }: { children: React.ReactNode }) {
  return children
}
