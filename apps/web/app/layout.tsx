import type { Metadata, Viewport } from 'next';
import { AppNav } from '../components/app-nav';
import { PwaSwRegister } from '../components/pwa-sw-register';
import { designTokens } from '../lib/design-tokens';
import { pwaManifest } from '../lib/pwa/manifest';
import './globals.css';

export const metadata: Metadata = {
  title: pwaManifest.name,
  description: pwaManifest.description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: pwaManifest.short_name,
  },
  icons: {
    icon: [
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
  other: {
    'msapplication-TileColor': designTokens.background,
  },
};

export const viewport: Viewport = {
  themeColor: pwaManifest.theme_color,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <PwaSwRegister />
        <div className="flex min-h-full flex-1 flex-col">
          <AppNav />
          <div className="flex flex-1 flex-col pb-[4.25rem] md:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
