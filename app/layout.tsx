import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TopBar from '@/components/TopBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mirae - 진로 탐색 플랫폼',
  description: 'Dashboard-based, multi-stage, AI-powered career exploration for Korean high school students',
  icons: {
    icon: '/asset/Mirae_Icon1.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <TopBar />
        {children}
      </body>
    </html>
  )
}
