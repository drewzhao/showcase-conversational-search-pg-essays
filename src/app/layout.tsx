import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Conversational Search with Typesense',
  description:
    "Typesense + 无问芯穹技术文档: AI 驱动的对话式搜索",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-gray-100 antialiased ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}