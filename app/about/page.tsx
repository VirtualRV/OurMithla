import type { Metadata } from "next"
import Link from "next/link"
import { DEFAULT_DESCRIPTION, SEO_KEYWORDS, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "About Mithila | OurMithla",
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Mithila | OurMithla",
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/about`,
  },
}

const HUB = [
  {
    href: "/panchang",
    title: "Mithila Panchang & Maithili Patra",
    desc: "Daily tithi, nakshatra, muhurat, and the full-month Maithili Patra used across Mithila.",
  },
  {
    href: "/kundli",
    title: "Janam Kundli of Mithila",
    desc: "Birth chart with Lagna, planets, and life guidance in the Vedic Mithila tradition.",
  },
  {
    href: "/horoscope",
    title: "Today’s Maithili Horoscope",
    desc: "Sidereal rashi guidance aligned with today’s Mithila Panchang.",
  },
  {
    href: "/blog",
    title: "Stories of Mithila",
    desc: "Madhubani art, Chhath Puja, Sama-Chakeva, Vidyapati, makhana, and Janakpur heritage.",
  },
  {
    href: "/blog/chhath-puja-great-festival-of-the-sun",
    title: "Chhath Puja",
    desc: "The great sun festival of Mithila and Bihar.",
  },
  {
    href: "/blog/timeless-art-of-madhubani-painting",
    title: "Madhubani painting",
    desc: "Mithila art from village walls to the world.",
  },
  {
    href: "/blog/sita-and-the-soul-of-janakpur",
    title: "Janakpur & Sita",
    desc: "The living Ramayana heart of Mithila in Madhesh, Nepal.",
  },
  {
    href: "/blog/makhana-mithila-superfood",
    title: "Makhana of Mithila",
    desc: "Fox nuts grown in the ponds of Mithila.",
  },
  {
    href: "/contact",
    title: "Contact",
    desc: "Reach the OurMithla team.",
  },
]

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mithila</p>
      <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
        About Mithila and OurMithla
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Mithila</strong> (मैथिली: मिथिला) is the historic
        cultural region spanning north Bihar in India and Madhesh in Nepal — Darbhanga, Madhubani,
        Sitamarhi, Saharsa, and Janakpur. OurMithla exists so people can find authentic{" "}
        <strong className="text-foreground">Mithila Panchang</strong>, Maithili Patra, Kundli, and
        cultural writing under the correct spelling of Mithila.
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Explore the living calendar of Mithila: tithi and nakshatra, auspicious days for vivah,
        janeu, and mundan, plus festivals such as Chhath, Madhushravani, and Sama-Chakeva.
      </p>

      <h2 className="mt-10 font-serif text-2xl text-foreground">Explore Mithila on this site</h2>
      <ul className="mt-4 space-y-3">
        {HUB.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-2xl border border-border bg-card px-4 py-3.5 hover:border-primary/40"
            >
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
