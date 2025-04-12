"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  bgColor: string
}

export default function AuthModal({ isOpen, onClose, bgColor }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const { login, register, isLoading, user } = useAuth()
  console.log(isLoading)
  const router = useRouter()

  // Determine the color family to apply appropriate styling
  const colorFamily = bgColor.split("-")[0]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await login(loginEmail, loginPassword)
      if (error) {
        console.error("Login failed:", error)
        return
      }
      onClose()
      router.push(user?.profile?.is_onboarded ? "/dashboard" : "/onboarding")
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await register(registerName, registerEmail, registerPassword)
      if (error) {
        console.error("Registration failed:", error)
        return
      }
      onClose()
      router.push("/onboarding")
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md">
        <motion.div
          className={`w-full rounded-lg bg-white/40 backdrop-blur-md p-8 
          shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] 
          border border-white/50 relative overflow-hidden`}
          style={{
            boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 0 15px rgba(255,255,255,0.5)`,
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle glow effect in the background */}
          <div className={`absolute -inset-1 opacity-20 blur-xl bg-${colorFamily}-300 z-0`}></div>

          <div className="relative z-10">
            <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800 font-handwriting">mindsync</h2>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-white/70 border-white/60 focus:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="bg-white/70 border-white/60 focus:border-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-gray-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Log In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="bg-white/70 border-white/60 focus:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-white/70 border-white/60 focus:border-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-700">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="bg-white/70 border-white/60 focus:border-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                  <p className="text-xs text-center text-gray-600">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
