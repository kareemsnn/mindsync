"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Check, CheckCircle, MessageSquare, Pencil, Upload, Users, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Mock activity data
const mockStats = {
  groupsJoined: 12,
  questionsAnswered: 48,
  messagesExchanged: 156,
}

export default function ProfilePage() {
  const { user, updateProfile, isUpdating } = useAuth()
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(user?.profile?.bio || "")
  const [tempBio, setTempBio] = useState(user?.profile?.bio || "")
  
  // Update bio state when user data changes
  useEffect(() => {
    if (user?.profile?.bio) {
      setBio(user.profile.bio)
      setTempBio(user.profile.bio)
    }
  }, [user?.profile?.bio])
  
  // Get display name from email
  const displayName = user?.profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User'

  const handleSaveBio = async () => {
    if (user) {
      try {
        await updateProfile({
          bio: tempBio
        })
        setBio(tempBio)
        setIsEditingBio(false)
        toast.success("Bio updated successfully!")
      } catch (error) {
        console.error("Error updating bio:", error)
        toast.error("Failed to update bio. Please try again.")
      }
    }
  }

  const handleCancelBio = () => {
    setTempBio(bio)
    setIsEditingBio(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profile?.image_url || "/placeholder.svg"} alt={displayName} />
                    <AvatarFallback className="text-2xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload avatar</span>
                  </Button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <Badge variant="outline">Member since May 2023</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>About Me</CardTitle>
                {!isEditingBio ? (
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit bio</span>
                  </Button>
                ) : null}
              </div>
              <CardDescription>Share a bit about yourself with your group members</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditingBio ? (
                <div className="space-y-4">
                  <Textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    placeholder="Write a short bio..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelBio} disabled={isUpdating}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveBio} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <p>{bio || "No bio added yet."}</p>
              )}
            </CardContent>
          </Card>

          {/* Interests & Traits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Interests</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit interests</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.interests && Array.isArray(user.profile.interests) ? (
                    user.profile.interests.map((interest: string) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No interests added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personality Traits</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit traits</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user?.profile?.describe && Array.isArray(user.profile.describe) ? (
                    user.profile.describe.map((trait: string) => (
                      <Badge key={trait} variant="secondary">
                        {trait}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No traits added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={user?.email} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Your participation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">{mockStats.groupsJoined}</p>
                    <p className="text-sm text-muted-foreground">Groups Joined</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">{mockStats.questionsAnswered}</p>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">{mockStats.messagesExchanged}</p>
                    <p className="text-sm text-muted-foreground">Messages Exchanged</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent interactions on MindSync</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">You sent a message in AI Ethics Enthusiasts</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">You answered all questions for this week</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">You joined a new group: Data Science Explorers</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
