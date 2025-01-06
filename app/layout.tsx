'use client'

import * as React from "react"
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from "../components/ui/toast"
import { cn } from "../lib/utils"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background")}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}