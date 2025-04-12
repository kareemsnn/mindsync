"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, MessageCircle, Calendar } from "lucide-react"
import dynamic from 'next/dynamic'

const AuthModal = dynamic(() => import('@/components/auth-modal'), {
  ssr: false
})

const gradients = [
  "bg-gradient-to-r from-sky-200 to-sky-100",
  "bg-gradient-to-r from-pink-200 to-pink-100",
  "bg-gradient-to-r from-orange-200 to-pink-100",
  "bg-gradient-to-r from-green-200 to-sky-100",
  "bg-gradient-to-r from-purple-200 to-pink-100",
]

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [gradient, setGradient] = useState("")
  const [bgColor, setBgColor] = useState("")

  useEffect(() => {
    const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)]
    setGradient(selectedGradient)
    setBgColor(selectedGradient.split(" ")[2].replace("from-", ""))
  }, [])

  return (
    <main className={`min-h-screen ${gradient}`}>
      <LandingPage onStart={() => setIsAuthModalOpen(true)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} bgColor={bgColor} />
    </main>
  )
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center text-center mb-16 pt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="font-handwriting text-6xl md:text-7xl text-black mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          mindsync
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Connect with like-minded individuals through meaningful conversations
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button onClick={onStart} className="bg-black text-white hover:bg-gray-800 shadow-md px-8 py-6 text-lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>

      {/* How It Works Section */}
      <motion.section
        className="mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-12">How MindSync Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-black/5 p-3 rounded-full w-fit mb-4">
              <Calendar className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-medium mb-2">Weekly Questions</h3>
            <p className="text-gray-700">
              Respond to themed questions covering business, tech, lifestyle, and more. New questions every Monday.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-black/5 p-3 rounded-full w-fit mb-4">
              <Users className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-medium mb-2">Smart Matching</h3>
            <p className="text-gray-700">
              Our algorithm forms dynamic discussion groups based on your responses and personality.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-black/5 p-3 rounded-full w-fit mb-4">
              <MessageCircle className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-medium mb-2">Group Chats</h3>
            <p className="text-gray-700">
              Connect in group chats that unlock every Friday. Engage in meaningful conversations with your matches.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Weekly Cycle Visualization */}
      <motion.section
        className="mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-12">Your Weekly Journey</h2>

        <div className="relative">
          {/* Timeline */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-black/10 -translate-x-1/2 z-0"></div>

          <div className="space-y-12 relative z-10">
            {/* Monday */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <motion.div
                className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50 md:text-right"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-medium mb-2">Monday</h3>
                <p className="text-gray-700">
                  New themed questions are released. Topics range from business and tech to lifestyle and philosophy.
                </p>
              </motion.div>
              <div className="hidden md:flex justify-center">
                <div className="bg-black/10 rounded-full h-8 w-8 flex items-center justify-center border-4 border-white/50">
                  <div className="bg-black/20 rounded-full h-3 w-3"></div>
                </div>
              </div>
            </div>

            {/* Monday-Thursday */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <div className="hidden md:flex justify-center">
                <div className="bg-black/10 rounded-full h-8 w-8 flex items-center justify-center border-4 border-white/50">
                  <div className="bg-black/20 rounded-full h-3 w-3"></div>
                </div>
              </div>
              <motion.div
                className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-medium mb-2">Monday-Thursday</h3>
                <p className="text-gray-700">
                  Submit your thoughtful responses to the weekly questions. Our algorithm analyzes your answers.
                </p>
              </motion.div>
            </div>

            {/* Friday */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <motion.div
                className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50 md:text-right"
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-medium mb-2">Friday</h3>
                <p className="text-gray-700">
                  Group chats are unlocked! Connect with your matches and engage in meaningful conversations.
                </p>
              </motion.div>
              <div className="hidden md:flex justify-center">
                <div className="bg-black/10 rounded-full h-8 w-8 flex items-center justify-center border-4 border-white/50">
                  <div className="bg-black/20 rounded-full h-3 w-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-12">Why Join MindSync?</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h3 className="text-xl font-medium mb-2">Meaningful Connections</h3>
            <p className="text-gray-700">
              Connect with people who share your interests, values, and perspectives. Build relationships that go beyond
              surface-level interactions.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h3 className="text-xl font-medium mb-2">Dynamic Groups</h3>
            <p className="text-gray-700">
              Experience fresh conversations each week with new group formations based on your evolving interests and
              responses.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h3 className="text-xl font-medium mb-2">Diverse Perspectives</h3>
            <p className="text-gray-700">
              Engage with a variety of viewpoints on interesting topics while maintaining common ground with your group
              members.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/40 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h3 className="text-xl font-medium mb-2">Personal Growth</h3>
            <p className="text-gray-700">
              Expand your horizons through thought-provoking questions and discussions that challenge and inspire you.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <h2 className="text-3xl font-semibold mb-6">Ready to connect?</h2>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Join MindSync today and start connecting with like-minded individuals through meaningful conversations.
        </p>
        <Button onClick={onStart} className="bg-black text-white hover:bg-gray-800 shadow-md px-8 py-6 text-lg">
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.section>
    </div>
  )
}
