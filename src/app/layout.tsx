// app/layout.tsx
import './globals.css'
import { AdminAuthProvider  } from '@/context/authContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminAuthProvider >
          {children}
        </AdminAuthProvider >
      </body>
    </html>
  )
}
