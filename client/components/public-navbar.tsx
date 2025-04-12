"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MenuIcon, XIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import AuthModal from "@/components/auth-modal"

const navLinks = [
  { name: "Home", href: "#home", id: "home" },
  { name: "Features", href: "#features", id: "features" },
  { name: "How It Works", href: "#how-it-works", id: "how-it-works" },
  { name: "Join", href: "#join", id: "join" },
]

interface PublicNavbarProps {
  onNavClick?: (id: string) => void;
  currentGradient?: string;
}

export default function PublicNavbar({ onNavClick, currentGradient = "gradient-purple-indigo" }: PublicNavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    if (onNavClick) {
      onNavClick(id)
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-black/30 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4",
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <a 
              href="#home" 
              className="flex items-center"
              onClick={(e) => handleNavClick(e, "home")}
            >
              <span className="text-2xl font-bold text-white">
                mindsync
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white/80 hover:text-white transition-colors"
                  onClick={(e) => handleNavClick(e, link.id)}
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="text-white hover:bg-white/10"
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="text-white"
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="text-white"
              >
                {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4 bg-black/30 backdrop-blur-md p-4 rounded-lg">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={(e) => handleNavClick(e, link.id)}
                  >
                    {link.name}
                  </a>
                ))}
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white w-full border border-white/20"
                >
                  Sign Up
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        bgColor={currentGradient}
      />
    </>
  )
} 