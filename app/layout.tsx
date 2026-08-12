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
  metadataBase: new URL('https://ourmithla.com'),
  applicationName: 'OurMithla',
  manifest: '/manifest.json',
  title: {
    default: 'OurMithla | Culture, Almanac & Community of Mithila',
    template: '%s | OurMithla',
  },
  description:
    'OurMithla celebrates the living heritage of Mithila — cultural stories, festivals, Madhubani art, and the daily Hindu Panchang, in English, Hindi, and Maithili.',
  keywords: ['Mithila', 'Panchang', 'Madhubani Art', 'Hindu Calendar', 'Maithili', 'Festivals'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OurMithla',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'google-adsense-account': ADSENSE_CLIENT,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ourmithla.com',
    title: 'OurMithla | Culture, Almanac & Community of Mithila',
    description: 'OurMithla celebrates the living heritage of Mithila — cultural stories, festivals, Madhubani art, and the daily Hindu Panchang.',
    siteName: 'OurMithla',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OurMithla | Culture, Almanac & Community of Mithila',
    description: 'OurMithla celebrates the living heritage of Mithila — cultural stories, festivals, Madhubani art, and the daily Hindu Panchang.',
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
