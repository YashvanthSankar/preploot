"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { AuthButton } from "@/components/auth-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { TrendingUp, Home } from "lucide-react"

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-bold">PrepLoot</h1>
          </Link>
          
          {session && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              <Link href="/progress">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Progress</span>
                </Button>
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ModeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}