"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Check, CheckCircle, MessageSquare, Pencil, Upload, Users, X, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js/auto'
import { Radar } from 'react-chartjs-2'
import { useProfile } from "@/hooks/use-profile"

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// FIFA-style radar chart component
const PersonalityRadarChart = ({ traitsVector }: { traitsVector: any }) => {
  // Check if traitsVector is defined and has the expected structure
  const results = traitsVector?.personality_results || {};

  const data: ChartData<'radar'> = {
    labels: [
      'Agreeableness', 
      'Conscientiousness', 
      'Extraversion',
      'Neuroticism',
      'Openness'
    ],
    datasets: [
      {
        label: 'Personality Profile',
        data: [
          results.agreeableness || 0,
          results.conscientiousness || 0,
          results.extraversion || 0,
          (results.neuroticism || 0), // Inverted for "Emotional Stability"
          results.openness || 0,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
        },
        grid: {
          circular: true,
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}/100`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.2,
      },
    },
    maintainAspectRatio: false,
  };

  console.log("Traits Vector for Radar Chart:", traitsVector);

  return (
    <div className="h-[400px] w-full p-4">
      <Radar data={data} options={options} />
    </div>
  );
};

// List of available interests and personality traits (same as in onboarding)
const interestsList = [
  "Technology",
  "Business",
  "Science",
  "Arts",
  "Health",
  "Politics",
  "Sports",
  "Travel",
  "Food",
  "Fashion",
  "Education",
  "Environment",
  "Philosophy",
  "Psychology",
  "History",
  "Literature",
]

const personalityTraitsList = [
  "Analytical",
  "Creative",
  "Practical",
  "Adventurous",
  "Reserved",
  "Outgoing",
  "Detail-oriented",
  "Big-picture thinker",
  "Empathetic",
  "Logical",
  "Spontaneous",
  "Organized",
]

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    profile,
    isLoading,
    isUpdating,
    isUploading,
    updateProfile,
    uploadProfileImage,
    cleanupObjectUrl,
    avatarObjectUrl
  } = useProfile()
  
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState("")
  const [tempBio, setTempBio] = useState("")
  
  // State for full name - just for display
  const [fullName, setFullName] = useState("")
  
  // State for interests and traits modals
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false)
  const [isTraitsModalOpen, setIsTraitsModalOpen] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  
  // State for full name editing
  const [isFullNameModalOpen, setIsFullNameModalOpen] = useState(false)
  const [newFullName, setNewFullName] = useState("")
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Update state when profile data changes
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "")
      setTempBio(profile.bio || "")
      setFullName(profile.full_name || "")
      setSelectedInterests(profile.interests as string[] || [])
      setSelectedTraits(profile.describe as string[] || [])
    }
  }, [profile])
  
  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      cleanupObjectUrl()
    }
  }, [cleanupObjectUrl])
  
  // Get display name from email
  const displayName = user?.profile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User'

  const handleSaveBio = async () => {
    await updateProfile({ bio: tempBio })
    setBio(tempBio)
    setIsEditingBio(false)
  }

  const handleCancelBio = () => {
    setTempBio(bio)
    setIsEditingBio(false)
  }

  // Toggle handlers for interests and traits
  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => 
      prev.includes(interest) 
        ? prev.filter((i) => i !== interest) 
        : [...prev, interest]
    )
  }

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) => 
      prev.includes(trait) 
        ? prev.filter((t) => t !== trait) 
        : [...prev, trait]
    )
  }

  // Save handlers for interests and traits
  const handleSaveInterests = async () => {
    await updateProfile({ interests: selectedInterests })
    setIsInterestsModalOpen(false)
  }

  const handleSaveTraits = async () => {
    await updateProfile({ describe: selectedTraits })
    setIsTraitsModalOpen(false)
  }

  // Handle saving the full name
  const handleSaveFullName = async () => {
    if (newFullName.trim()) {
      await updateProfile({ full_name: newFullName.trim() })
      setFullName(newFullName.trim())
      setIsFullNameModalOpen(false)
    }
  }

  // Open the full name modal and set the current name as the initial value
  const handleOpenFullNameModal = () => {
    setNewFullName(fullName)
    setIsFullNameModalOpen(true)
  }

  // Image upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadProfileImage(file)
    
    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
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
          {/* <TabsTrigger value="activity">Activity</TabsTrigger> */}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    {profile?.displayImageUrl || avatarObjectUrl ? (
                      <div className="w-full h-full overflow-hidden rounded-full relative">
                        <img 
                          src={avatarObjectUrl || profile?.displayImageUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Error loading avatar image, showing fallback", e)
                          }}
                        />
                      </div>
                    ) : (
                      <AvatarFallback className="text-2xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    onClick={handleAvatarClick}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span className="sr-only">Upload avatar</span>
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold">{fullName || displayName}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Name (Editable) */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Full Name</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleOpenFullNameModal}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit full name</span>
                </Button>
              </div>
              <CardDescription>Your full name as displayed to other users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{fullName || "N/A"}</p>
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
                  <Button variant="ghost" size="icon" onClick={() => setIsInterestsModalOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit interests</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests && selectedInterests.length > 0 ? (
                    selectedInterests.map((interest: string) => (
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
                  <Button variant="ghost" size="icon" onClick={() => setIsTraitsModalOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit traits</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedTraits && selectedTraits.length > 0 ? (
                    selectedTraits.map((trait: string) => (
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

          {/* Personality Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Profile</CardTitle>
              <CardDescription>A visual representation of your personality attributes</CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.traits_vector ? (
                <PersonalityRadarChart traitsVector={profile.traits_vector} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No personality traits added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>

      {/* Interests Edit Modal */}
      <Dialog open={isInterestsModalOpen} onOpenChange={setIsInterestsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Interests</DialogTitle>
            <DialogDescription>
              Select topics you're interested in discussing with others
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {interestsList.map((interest) => (
              <div
                key={interest}
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                  selectedInterests.includes(interest)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleInterestToggle(interest)}
              >
                <Checkbox
                  checked={selectedInterests.includes(interest)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span>{interest}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsInterestsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInterests} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Personality Traits Edit Modal */}
      <Dialog open={isTraitsModalOpen} onOpenChange={setIsTraitsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Personality Traits</DialogTitle>
            <DialogDescription>
              Select traits that best represent your personality
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {personalityTraitsList.map((trait) => (
              <div
                key={trait}
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                  selectedTraits.includes(trait)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleTraitToggle(trait)}
              >
                <Checkbox
                  checked={selectedTraits.includes(trait)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span>{trait}</span>
              </div>
            ))}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTraitsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTraits} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Name Edit Modal */}
      <Dialog open={isFullNameModalOpen} onOpenChange={setIsFullNameModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Full Name</DialogTitle>
            <DialogDescription>
              Update your name as displayed to other users
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-name">Current Name</Label>
              <Input id="current-name" value={fullName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">New Name</Label>
              <Input 
                id="new-name" 
                value={newFullName} 
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Enter your new full name"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsFullNameModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveFullName} 
              disabled={isUpdating || !newFullName.trim() || newFullName.trim() === fullName}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
