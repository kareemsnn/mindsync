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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  bgColor?: string
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  
  // Loading states
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  
  // Error states
  const [loginError, setLoginError] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [termsError, setTermsError] = useState(false)
  
  const { login, register, user } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoginSubmitting(true)
    
    try {
      const { error } = await login(loginEmail, loginPassword)
      if (error) {
        setLoginError(error.message || "Failed to login. Please try again.")
        return
      }
      onClose()
      router.push(user?.profile?.is_onboarded ? "/dashboard" : "/onboarding")
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.")
      console.error("Login failed:", error)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset all error states
    setRegisterError(null)
    setPasswordMismatch(false)
    setTermsError(false)
    
    // Form validation
    if (registerPassword !== confirmPassword) {
      setPasswordMismatch(true)
      return
    }
    
    if (!agreeTerms) {
      setTermsError(true)
      return
    }
    
    setIsRegisterSubmitting(true)
    
    try {
      const { error } = await register(registerName, registerEmail, registerPassword)
      if (error) {
        setRegisterError(error.message || "Failed to create account. Please try again.")
        return
      }
      onClose()
      router.push("/onboarding")
    } catch (error) {
      setRegisterError("An unexpected error occurred. Please try again.")
      console.error("Registration failed:", error)
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <motion.div
          className="w-full rounded-lg bg-primary-dark border-primary/30 p-8 
          shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.05)] 
          border relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            <h2 className="mb-6 text-2xl font-bold text-center text-white">mindsync</h2>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary-medium">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary text-white">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  {loginError && (
                    <div className="p-3 text-sm text-red-300 bg-red-900/50 border border-red-800 rounded-md">
                      {loginError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="bg-primary-light border-primary/30 text-white placeholder:text-white/50"
                      disabled={isLoginSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-primary-light border-primary/30 text-white placeholder:text-white/50"
                      disabled={isLoginSubmitting}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm text-white/80 hover:text-white hover:underline cursor-not-allowed">
                      Forgot password?
                    </span>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-medium hover:bg-primary text-white border border-primary/30" 
                    disabled={isLoginSubmitting}
                  >
                    {isLoginSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Log In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form className="space-y-4" onSubmit={handleRegister}>
                  {registerError && (
                    <div className="p-3 text-sm text-red-300 bg-red-900/50 border border-red-800 rounded-md">
                      {registerError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="bg-primary-light border-primary/30 text-white placeholder:text-white/50"
                      disabled={isRegisterSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="bg-primary-light border-primary/30 text-white placeholder:text-white/50"
                      disabled={isRegisterSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        setPasswordMismatch(false);
                      }}
                      placeholder="••••••••"
                      required
                      className={`bg-primary-light border-primary/30 text-white placeholder:text-white/50 ${
                        passwordMismatch ? "border-red-500" : ""
                      }`}
                      disabled={isRegisterSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordMismatch(false);
                      }}
                      placeholder="••••••••"
                      required
                      className={`bg-primary-light border-primary/30 text-white placeholder:text-white/50 ${
                        passwordMismatch ? "border-red-500" : ""
                      }`}
                      disabled={isRegisterSubmitting}
                    />
                    {passwordMismatch && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => {
                        setAgreeTerms(checked as boolean);
                        setTermsError(false);
                      }}
                      className={`border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-white ${
                        termsError ? "border-red-500" : ""
                      }`}
                      disabled={isRegisterSubmitting}
                    />
                    <Label
                      htmlFor="terms"
                      className={`text-sm font-normal text-white/80 leading-tight ${
                        termsError ? "text-red-400" : ""
                      }`}
                    >
                      I agree to the{" "}
                      <span className="underline hover:text-white cursor-not-allowed">
                        terms and conditions
                      </span>
                    </Label>
                  </div>
                  {termsError && (
                    <p className="text-xs text-red-400 mt-1">You must agree to the terms and conditions</p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary-medium hover:bg-primary text-white border border-primary/30" 
                    disabled={isRegisterSubmitting}
                  >
                    {isRegisterSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Background blur elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}