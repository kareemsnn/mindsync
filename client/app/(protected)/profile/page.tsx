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

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// Mock activity data
const mockStats = {
  groupsJoined: 12,
  questionsAnswered: 48,
  messagesExchanged: 156,
}



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
  const { user, updateProfile, isUpdating } = useAuth()
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(user?.profile?.bio || "")
  const [tempBio, setTempBio] = useState(user?.profile?.bio || "")
  
  // Add state for full name - just for display
  const [fullName, setFullName] = useState(user?.profile?.full_name || "")
  
  // State for interests and traits modals
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false)
  const [isTraitsModalOpen, setIsTraitsModalOpen] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.profile?.interests as string[] || [])
  const [selectedTraits, setSelectedTraits] = useState<string[]>(user?.profile?.describe as string[] || [])
  
  // State for full name editing
  const [isFullNameModalOpen, setIsFullNameModalOpen] = useState(false)
  const [newFullName, setNewFullName] = useState("")
  
  // State for image upload
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string>("")
  
  // State for personality traits vector
  const [traitsVector, setTraitsVector] = useState<any>(null)
  
  // Debug log
  useEffect(() => {
    console.log("Current avatarUrl:", avatarUrl ? avatarUrl.substring(0, 50) + "..." : "empty")
  }, [avatarUrl])

  // Update state when user data changes
  useEffect(() => {
    if (user?.profile) {
      if (user.profile.bio) {
        setBio(user.profile.bio)
        setTempBio(user.profile.bio)
      }
      if (user.profile.full_name) {
        setFullName(user.profile.full_name)
      }
      if (user.profile.interests) {
        setSelectedInterests(user.profile.interests as string[])
      }
      if (user.profile.describe) {
        setSelectedTraits(user.profile.describe as string[])
      }
      // Set traits vector from database
      if (user.profile.traits_vector) {
        setTraitsVector(user.profile.traits_vector)
        console.log("Loaded traits vector:", user.profile.traits_vector)
      }
      if (user.profile.image_url) {
        console.log("Image data from profile:", user.profile.image_url.substring(0, 50))
        
        try {
          // Convert hex bytea to data URL if needed
          const dataUrl = hexToDataUrl(user.profile.image_url)
          
          if (dataUrl) {
            console.log("Converted to data URL successfully:", dataUrl.substring(0, 50))
            setTimeout(() => {
              if (user.profile && user.profile.image_url) {
                setAvatarUrl(dataUrl)
              }
            }, 100)
          } else {
            console.warn("Failed to convert image data to valid format")
            setAvatarUrl("")
          }
        } catch (error) {
          console.error("Error processing image data:", error)
          setAvatarUrl("")
        }
      }
    }
  }, [user?.profile])
  
  // Cleanup object URL when component unmounts or when avatarObjectUrl changes
  useEffect(() => {
    return () => {
      if (avatarObjectUrl) {
        URL.revokeObjectURL(avatarObjectUrl)
      }
    }
  }, [avatarObjectUrl])
  
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
    if (user) {
      try {
        await updateProfile({
          interests: selectedInterests
        })
        setIsInterestsModalOpen(false)
        toast.success("Interests updated successfully!")
      } catch (error) {
        console.error("Error updating interests:", error)
        toast.error("Failed to update interests. Please try again.")
      }
    }
  }

  const handleSaveTraits = async () => {
    if (user) {
      try {
        await updateProfile({
          describe: selectedTraits
        })
        setIsTraitsModalOpen(false)
        toast.success("Personality traits updated successfully!")
      } catch (error) {
        console.error("Error updating personality traits:", error)
        toast.error("Failed to update personality traits. Please try again.")
      }
    }
  }

  // Handle saving the full name
  const handleSaveFullName = async () => {
    if (user && newFullName.trim()) {
      try {
        await updateProfile({
          full_name: newFullName.trim()
        })
        setFullName(newFullName.trim())
        setIsFullNameModalOpen(false)
        toast.success("Full name updated successfully!")
      } catch (error) {
        console.error("Error updating full name:", error)
        toast.error("Failed to update full name. Please try again.")
      }
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
    if (!file || !user) return

    console.log("Selected file:", file.name, "Size:", file.size, "bytes", "Type:", file.type)

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    setIsUploading(true)
    try {
      // Create a temporary URL for immediate display
      if (avatarObjectUrl) {
        // Revoke the old object URL if it exists
        URL.revokeObjectURL(avatarObjectUrl)
      }
      const tempUrl = URL.createObjectURL(file)
      setAvatarObjectUrl(tempUrl)
      setAvatarUrl(tempUrl) // Use the object URL for display immediately

      // Skip compression for small files (less than 100KB)
      let imageToConvert = file
      if (file.size > 100 * 1024) {
        console.log("Image is larger than 100KB, performing compression")
        imageToConvert = await resizeAndCompressImage(file)
        console.log("Image compressed from", file.size, "to approximately", imageToConvert.size, "bytes")
      } else {
        console.log("Image is small, skipping compression")
      }
      
      // Convert the image to base64
      console.log("Converting image to base64")
      const base64Image = await convertFileToBase64(imageToConvert)
      const truncatedBase64 = base64Image.substring(0, 50) + "..." + base64Image.substring(base64Image.length - 10)
      console.log("Base64 conversion complete, result:", truncatedBase64, "Length:", base64Image.length)
      
      // Store the base64 data directly - do not send as hex
      try {
        // Update the user's profile with the base64 image directly
        console.log("Updating profile with image data")
        await updateProfile({
          image_url: base64Image
        })
        console.log("Profile update completed successfully")
        
        // Keep using the object URL for display to avoid rendering issues
        toast.success("Profile picture updated successfully!")
      } catch (updateError) {
        console.error("Error updating profile:", updateError)
        throw updateError
      }
    } catch (error) {
      console.error("Error in image upload process:", error)
      toast.error("Failed to upload image. Please try again.")
      
      // If there was an error, revert to the original image if any
      if (user?.profile?.image_url) {
        const dataUrl = hexToDataUrl(user.profile.image_url)
        setAvatarUrl(dataUrl)
      } else {
        setAvatarUrl("")
      }
    } finally {
      setIsUploading(false)
      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Resize and compress image to reduce size
  const resizeAndCompressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          // Calculate new dimensions (max 800px width/height)
          const maxSize = 800
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }
          
          // Create canvas and resize image
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx!.drawImage(img, 0, 0, width, height)
          
          // Convert to Blob with compression
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from image'))
              return
            }
            // Create a new File object from the blob
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(newFile)
          }, 'image/jpeg', 0.7) // Compression quality 0.7 (70%)
        }
        img.onerror = () => {
          reject(new Error('Error loading image for compression'))
        }
      }
      reader.onerror = () => {
        reject(new Error('Error reading file for compression'))
      }
    })
  }

  // Convert file to base64 string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          console.log("Base64 conversion successful, length:", reader.result.length)
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

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
      console.error('Error converting hex to data URL:', error);
      return '';
    }
  };

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
                    {avatarUrl ? (
                      <div className="w-full h-full overflow-hidden rounded-full relative">
                        <img 
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Error loading avatar image, showing fallback", e)
                            // Only clear the URL if it's not an object URL (to avoid clearing during upload)
                            if (!avatarUrl.startsWith('blob:')) {
                              setAvatarUrl("")
                            }
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
                  <Button variant="ghost" size="icon" onClick={() => setIsTraitsModalOpen(true)}>
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

          {/* Personality Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Profile</CardTitle>
              <CardDescription>A visual representation of your personality attributes</CardDescription>
            </CardHeader>
            <CardContent>
              {traitsVector ? (
                <PersonalityRadarChart traitsVector={traitsVector} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No personality traits added yet.</p>
                </div>
              )}
            </CardContent>
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
