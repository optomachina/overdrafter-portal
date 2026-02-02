import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Overdrafter - CAD Design Portal',
  description: 'Precision mechanical design on demand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}