"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

const interests = [
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

const personalityTraits = [
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { updateProfile, user, isUpdating } = useAuth()
  const router = useRouter()

  // Initialize state from existing profile if available
  useEffect(() => {
    if (user?.profile) {
      if (user.profile.interests) setSelectedInterests(user.profile.interests as string[]);
      if (user.profile.describe) setSelectedTraits(user.profile.describe as string[]);
      if (user.profile.bio) setBio(user.profile.bio);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user?.profile]);

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) => (prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]))
  }

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      try {
        await updateProfile({
          bio: bio,
          interests: selectedInterests,
          describe: selectedTraits,
          is_onboarded: true
        })
        
        toast.success("Profile updated successfully!")
        router.push("/dashboard")
      } catch (error) {
        console.error("Error updating profile:", error)
        toast.error("Failed to update profile. Please try again.")
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-sky-200 to-sky-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-md p-12 rounded-lg shadow-lg border border-white/50 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
          <p className="mt-4 text-sky-700 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-200 to-sky-100 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/70 backdrop-blur-md border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-handwriting text-center">Welcome to MindSync</CardTitle>
            <CardDescription className="text-center">
              Let's set up your profile to help you connect with like-minded individuals
            </CardDescription>
            <Progress value={progress} className="h-2 mt-4" />
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-lg font-medium">Select your interests</h3>
                <p className="text-sm text-gray-500">Choose at least 3 topics you're interested in discussing</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {interests.map((interest) => (
                    <div
                      key={interest}
                      className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedInterests.includes(interest)
                          ? "bg-black text-white border-black"
                          : "bg-white/50 hover:bg-white/80 border-gray-200"
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      <Checkbox
                        checked={selectedInterests.includes(interest)}
                        className="data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                      <span>{interest}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-lg font-medium">How would you describe yourself?</h3>
                <p className="text-sm text-gray-500">Select traits that best represent your personality</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {personalityTraits.map((trait) => (
                    <div
                      key={trait}
                      className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                        selectedTraits.includes(trait)
                          ? "bg-black text-white border-black"
                          : "bg-white/50 hover:bg-white/80 border-gray-200"
                      }`}
                      onClick={() => handleTraitToggle(trait)}
                    >
                      <Checkbox
                        checked={selectedTraits.includes(trait)}
                        className="data-[state=checked]:bg-white data-[state=checked]:text-black"
                      />
                      <span>{trait}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-lg font-medium">Tell us about yourself</h3>
                <p className="text-sm text-gray-500">
                  Share a brief bio to help others get to know you better (optional)
                </p>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I'm passionate about..."
                    className="h-32 bg-white/70"
                  />
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || isUpdating}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                isUpdating || 
                (step === 1 && selectedInterests.length < 3) || 
                (step === 2 && selectedTraits.length < 2)
              }
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : step === totalSteps ? (
                <>
                  Complete <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}