import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ivorytech.online'),
  title: {
    default: 'عيدية وفرحة - تحدي العيديات الذكي',
    template: '%s | عيدية وفرحة',
  },
  description: 'تجربة تفاعلية مرحة لتوزيع العيديات على الأطفال مع أسئلة دينية عن عيد الأضحى والحج وقصة سيدنا إبراهيم.',
  keywords: [
    'عيدية',
    'عيد الأضحى',
    'العيد الكبير',
    'تحدي العيدية',
    'أسئلة دينية للأطفال',
    'الحج',
    'الأضحية',
    'ألعاب تعليمية للأطفال',
  ],
  authors: [{ name: 'omarabovli' }],
  creator: 'omarabovli',
  publisher: 'IvoryTech',
  applicationName: 'عيدية وفرحة',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://ivorytech.online',
    siteName: 'عيدية وفرحة',
    title: 'عيدية وفرحة - تحدي العيديات الذكي',
    description: 'حوّل توزيع العيدية إلى ذكرى ممتعة وتعليمية للأطفال بأسئلة دينية وأجواء عيد الأضحى.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'عيدية وفرحة - تحدي العيديات الذكي',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عيدية وفرحة - تحدي العيديات الذكي',
    description: 'توزيع عيديات تفاعلي للأطفال مع أسئلة دينية وأجواء عيد الأضحى.',
    images: ['/logo.png'],
  },
  generator: 'Next.js',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
