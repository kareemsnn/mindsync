"use client"
import { useRouter } from "next/navigation"
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
import { Brain, Settings, User, Moon, Sun } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

// Protected dashboard navbar
export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  
  // Prevent hydration mismatch with theme
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
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
    <nav className="sticky top-0 z-40 border-b bg-background px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo - visible on all screens */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="font-handwriting text-xl">
            <Brain className="h-5 w-5" />
          </Link>
        </div>
        
        {/* Right side actions - shown on all screens */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {isMounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          
          {/* User dropdown - shown on all screens */}
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
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center w-full">
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