import type { Metadata, Viewport } from 'next';
import { Manrope, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'SOTA Suite - High-Performance Web Application',
    template: '%s | SOTA Suite',
  },
  description: 'State-of-the-Art web application with aggressive performance optimization, PWA support, and solid design system.',
  keywords: ['performance', 'web app', 'PWA', 'react', 'next.js'],
  authors: [{ name: 'SOTA Suite' }],
  creator: 'SOTA Suite',
  metadataBase: new URL('https://sota-suite.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sota-suite.dev',
    siteName: 'SOTA Suite',
    title: 'SOTA Suite - High-Performance Web Application',
    description: 'State-of-the-Art web application with aggressive performance optimization.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SOTA Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOTA Suite - High-Performance Web Application',
    description: 'State-of-the-Art web application with aggressive performance optimization.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-surface-950 font-sans text-surface-50 antialiased">
        <div id="root">{children}</div>
        <div id="modal-root" />
      </body>
    </html>
  );
}
