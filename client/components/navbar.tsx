"use client"

import { useAuth } from "@/contexts/auth-context"
import { Bell, MessageSquare, Settings, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      console.log("Logging out")
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  
  // Extract user display name from email if available
  const displayName = user?.profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <nav className="border-b bg-background px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard" className="font-handwriting text-xl">
            mindsync
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/chats">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile?.image_url || "/placeholder.svg"} alt={displayName} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
