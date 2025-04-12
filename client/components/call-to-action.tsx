import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import AuthModal from "@/components/auth-modal"

interface CallToActionProps {
  gradient?: string;
}

export default function CallToAction({ gradient = "gradient-purple-indigo" }: CallToActionProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden scroll-mt-16 bg-primary-gradient">
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto bg-primary-light rounded-3xl p-8 md:p-12 shadow-lg border border-primary/20">
          <div className="text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Ready to find your mind tribe?
            </motion.h2>
            <motion.p
              className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of users who have already discovered meaningful connections through our personality-based
              matching system. Sign up today and start your journey to authentic social connections.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-6 h-auto text-lg rounded-full shadow-lg hover:shadow-xl transition-all border border-white/20">
              Join mindsync
              <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  )
}
