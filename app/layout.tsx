import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Marcellus } from 'next/font/google'
import './globals.css'
import { I18nProvider } from '@/components/i18n-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ThemeProvider } from '@/components/theme-provider'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import { GoogleAnalytics } from '@/components/google-analytics'
import { PwaRegister } from '@/components/pwa-register'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { SiteSettingsProvider } from '@/components/site-settings-provider'
import { ADSENSE_CLIENT } from '@/lib/adsense'
import { getSettings } from '@/lib/settings'
import { SeoJsonLd } from '@/components/seo-json-ld'
import { DEFAULT_DESCRIPTION, SEO_KEYWORDS, SITE_NAME, SITE_URL } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const marcellus = Marcellus({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-marcellus',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: '/manifest.json',
  title: {
    default: 'Mithila Panchang, Maithili Patra & Culture | OurMithla',
    template: '%s | OurMithla',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'google-adsense-account': ADSENSE_CLIENT,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'Mithila Panchang, Maithili Patra & Culture | OurMithla',
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mithila Panchang, Maithili Patra & Culture | OurMithla',
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
      },
      {
        url: '/icon-dark-32x32.png',
      },
      {
        url: '/icon.png',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c8622d',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()

  return (
    <html lang="en" suppressHydrationWarning className={`bg-background ${inter.variable} ${marcellus.variable}`}>
      <head>
        {/* Plain script tag — next/script adds data-nscript which AdSense rejects */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        <SeoJsonLd />
      </head>
      <body className="font-sans antialiased">
        <PwaRegister />
        <GoogleAnalytics />
        <AnalyticsTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteSettingsProvider initial={settings}>
            <I18nProvider>
              <SiteHeader />
              <div className="min-h-[calc(100vh-4rem)]">{children}</div>
              <SiteFooter />
            </I18nProvider>
          </SiteSettingsProvider>
          <PwaInstallPrompt />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
