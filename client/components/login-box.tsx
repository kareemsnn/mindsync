"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface LoginBoxProps {
  bgColor: string
}

export default function LoginBox({ bgColor }: LoginBoxProps) {
  // Determine the color family to apply appropriate styling
  const colorFamily = bgColor.split("-")[0]
  
  // Get auth context
  const { login, register } = useAuth()
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [name, setName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  
  // Loading states
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  
  // Error states
  const [loginError, setLoginError] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)
  
  // Form handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoginSubmitting(true)
    
    try {
      const { error } = await login(loginEmail, loginPassword)
      if (error) {
        setLoginError(error.message)
      }
    } finally {
      setIsLoginSubmitting(false)
    }
  }
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)
    setIsRegisterSubmitting(true)
    
    try {
      const { error } = await register(name, registerEmail, registerPassword)
      if (error) {
        setRegisterError(error.message)
      }
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  return (
    <motion.div
      className={`w-full max-w-md rounded-lg bg-white/40 backdrop-blur-md p-8 
      shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] 
      border border-white/50 relative overflow-hidden`}
      style={{
        boxShadow: `0 15px 30px rgba(0,0,0,0.1), 0 0 15px rgba(255,255,255,0.5)`,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Subtle glow effect in the background */}
      <div className={`absolute -inset-1 opacity-20 blur-xl bg-${colorFamily}-300 z-0`}></div>

      <div className="relative z-10">
        <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800 font-handwriting">mindsync</h2>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form className="space-y-4" onSubmit={handleLogin}>
              {loginError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-white/70 border-white/60 focus:border-white"
                  disabled={isLoginSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-white/70 border-white/60 focus:border-white"
                  disabled={isLoginSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-sm text-gray-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isLoginSubmitting}>
                {isLoginSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Log In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form className="space-y-4" onSubmit={handleRegister}>
              {registerError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {registerError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/70 border-white/60 focus:border-white"
                  disabled={isRegisterSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="bg-white/70 border-white/60 focus:border-white"
                  disabled={isRegisterSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-white/70 border-white/60 focus:border-white"
                  disabled={isRegisterSubmitting}
                />
              </div>
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={isRegisterSubmitting}>
                {isRegisterSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : "Create Account"}
              </Button>
              <p className="text-xs text-center text-gray-600">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}
