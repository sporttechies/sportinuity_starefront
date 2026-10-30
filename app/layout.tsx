import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sportinuity | Sport travel, made simple',
  description: 'Plan team travel, accommodation, transport, and event logistics with Sportinuity.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
