import './globals.css'
import { AppProvider } from '@/lib/state'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-unknown-black text-unknown-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
