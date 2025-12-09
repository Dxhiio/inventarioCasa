'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Scan, ListTodo, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Buscar' },
    { href: '/scan', icon: Scan, label: 'Scanner' },
    { href: '/social', icon: ListTodo, label: 'Social' },
    { href: '/profile', icon: User, label: 'Perfil' },
  ]

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="flex items-center gap-1 p-2 rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/5 shadow-xl pointer-events-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center justify-center p-3 rounded-xl transition-all duration-200 group",
                isActive ? "text-primary-foreground bg-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {isActive && <span className="sr-only">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
