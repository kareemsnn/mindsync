"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{user?.profile?.full_name}</p>
                  </div>
                  {user?.profile?.bio && (
                    <div>
                      <p className="text-sm font-medium">Bio</p>
                      <p className="text-sm text-muted-foreground">{user?.profile?.bio}</p>
                    </div>
                  )}
                  {user?.profile?.interests && user?.profile?.interests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Interests</p>
                      <p className="text-sm text-muted-foreground">{user?.profile?.interests.join(", ")}</p>
                    </div>
                  )}
                  {user?.profile?.is_onboarded !== null && user?.profile?.is_onboarded !== undefined && (
                    <div>
                      <p className="text-sm font-medium">Onboarded</p>
                      <p className="text-sm text-muted-foreground">{user?.profile?.is_onboarded ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="space-y-4">
                  <Button variant="destructive" onClick={logout}>
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
