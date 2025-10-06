"use client"

import { AuthButton } from "@/components/auth-button"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-xl font-bold">PrepLoot</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ModeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}