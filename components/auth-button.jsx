"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github, Chrome, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button disabled>Loading...</Button>
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image} alt={session.user?.name} />
              <AvatarFallback>
                {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session.user?.name && (
                <p className="font-medium">{session.user.name}</p>
              )}
              {session.user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={() => signIn("google")}
        variant="outline"
        className="gap-2 text-xs sm:text-sm"
        size="sm"
      >
        <Chrome className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in with Google</span>
        <span className="sm:hidden">Google</span>
      </Button>
      <Button
        onClick={() => signIn("github")}
        variant="outline"
        className="gap-2 text-xs sm:text-sm"
        size="sm"
      >
        <Github className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in with GitHub</span>
        <span className="sm:hidden">GitHub</span>
      </Button>
    </div>
  )
}