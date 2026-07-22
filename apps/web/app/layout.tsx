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
        <div className="app-shell">
          <AppNav />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  );
}
