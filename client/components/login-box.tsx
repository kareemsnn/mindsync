"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoginBoxProps {
  bgColor: string
}

export default function LoginBox({ bgColor }: LoginBoxProps) {
  // Determine the color family to apply appropriate styling
  const colorFamily = bgColor.split("-")[0]

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
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
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
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                Log In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
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
                  placeholder="Create a password"
                  required
                  className="bg-white/70 border-white/60 focus:border-white"
                />
              </div>
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
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
  )
}
