'use client'

import * as React from "react"
import './globals.css'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from "../components/ui/button"
import { ToastProvider } from "../components/ui/toast"

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
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.body.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = newTheme
  }

  return (
    <html lang="en">
      <body className={`${inter.className} ${theme}`}>
        <ToastProvider>
          {React.cloneElement(children as React.ReactElement, { toggleTheme, theme })}
        </ToastProvider>
      </body>
    </html>
  )
}