import type { Metadata } from 'next';
import { AppNav } from '../components/app-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Книжная вселенная',
  description: 'Коллекция читателя, каталог и рейтинги',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
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
