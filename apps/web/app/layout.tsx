import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}
