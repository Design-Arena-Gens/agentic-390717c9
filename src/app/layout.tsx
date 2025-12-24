import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grok AI Chat',
  description: 'Chat with Grok AI by xAI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
