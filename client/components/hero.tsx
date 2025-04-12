import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import { useState } from "react"
import AuthModal from "@/components/auth-modal"

interface HeroProps {
  gradient?: string;
}

export default function Hero({ gradient = "gradient-purple-indigo" }: HeroProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <section id="home" className={`pt-32 pb-20 md:pt-40 md:pb-28 px-4 relative overflow-hidden flowing-gradient ${gradient}`}>
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Connect with minds that match yours
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            mindsync brings together people with similar personality traits and socio-economic backgrounds, creating
            meaningful connections in a world of digital noise.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all border border-white/20"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        bgColor={gradient}
      />
    </section>
  )
}
