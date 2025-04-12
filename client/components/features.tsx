"use client"

import { motion } from "framer-motion"
import { Users, MessageSquare, BarChart4, Network } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeaturesProps {
  gradient?: string;
}

const features = [
  {
    icon: <Users className="h-10 w-10 text-white" />,
    title: "Personality Matching",
    description:
      "Our advanced NLP algorithms analyze your responses to daily questions, creating a detailed personality profile to match you with like-minded individuals.",
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-white" />,
    title: "Group Day",
    description:
      "Every week, experience our special Group Day where you're placed in chat groups with others based on similarity scores, expanding your social circle.",
  },
  {
    icon: <BarChart4 className="h-10 w-10 text-white" />,
    title: "Similarity Scoring",
    description:
      "Watch your connections grow with our unique similarity scoring system that visualizes how you relate to others in your network.",
  },
  {
    icon: <Network className="h-10 w-10 text-white" />,
    title: "Network Visualization",
    description:
      "Explore your social connections through interactive network graphs that reveal patterns in your relationships and personality traits.",
  },
]

export default function Features({ gradient = "gradient-purple-indigo" }: FeaturesProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="features" className={`py-20 px-4 scroll-mt-16 flowing-gradient ${gradient}`}>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Key Features
          </motion.h2>
          <motion.p
            className="text-lg text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover how mindsync helps you connect with people who truly understand you
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-white/10 backdrop-blur-md border-white/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
