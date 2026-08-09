import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OurMithla | Culture, Almanac & Community of Mithila',
    short_name: 'OurMithla',
    description:
      'OurMithla celebrates the living heritage of Mithila — cultural stories, festivals, Madhubani art, and the daily Hindu Panchang.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#c8622d',
    orientation: 'portrait-primary',
    categories: ['culture', 'news', 'lifestyle', 'utilities'],
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
