import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact OurMithla",
  description:
    "Write to OurMithla about Mithila culture, Panchang, Maithili Patra, Kundli, or community articles. Based in Mithila (Bihar, India and Madhesh, Nepal).",
  alternates: { canonical: `${SITE_URL}/contact` },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
