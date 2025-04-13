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

// Helper function to convert hex-encoded bytea to a displayable data URL
const hexToDataUrl = (hexString: string): string => {
  try {
    // If it already starts with data:image, it's already a data URL
    if (hexString.startsWith('data:image')) {
      return hexString;
    }
    
    // Check if it's a hex-encoded bytea from PostgreSQL (starts with \\x)
    if (hexString.startsWith('\\x')) {
      // Remove the \\x prefix
      const hex = hexString.substring(2);
      
      // Convert hex to binary
      let binary = '';
      for (let i = 0; i < hex.length; i += 2) {
        const hexByte = hex.substr(i, 2);
        const byte = parseInt(hexByte, 16);
        binary += String.fromCharCode(byte);
      }
      
      // If it looks like a data URL after conversion, return it
      if (binary.startsWith('data:image')) {
        return binary;
      } else {
        console.error('Converted binary does not start with data:image');
        return '';
      }
    }
    
    console.warn('Unknown image format:', hexString.substring(0, 20));
    return '';
  } catch (error) {
    console.error('Error processing hex string:', error);
    return '';
  }
};

// Protected dashboard navbar
export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  
  // Prevent hydration mismatch with theme
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Handle profile image loading
  useEffect(() => {
    if (user?.profile?.image_url) {
      try {
        // Convert hex bytea to data URL if needed
        const dataUrl = hexToDataUrl(user.profile.image_url)
        if (dataUrl) {
          setAvatarUrl(dataUrl)
        }
      } catch (error) {
        console.error("Error processing image data in navbar:", error)
        setAvatarUrl("")
      }
    }
  }, [user?.profile?.image_url])
  
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
                <Avatar className="h-8 w-8 overflow-hidden">
                  <AvatarImage 
                    src={avatarUrl || "/placeholder.svg"} 
                    alt={displayName} 
                    className="object-cover aspect-square"
                  />
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