"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/public-navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import CallToAction from "@/components/call-to-action";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function Home() {
  const [started, setStarted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!started ? (
          <motion.div
            key="start-screen"
            className="flex flex-col items-center justify-center min-h-screen bg-primary-gradient"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-center text-white mb-8 z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              mindsync
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="z-10"
            >
              <Button
                size="lg"
                className="bg-primary-light text-white hover:bg-primary-medium px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all border border-primary/20"
                onClick={() => setStarted(true)}
              >
                Start
              </Button>
            </motion.div>
            
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full filter blur-3xl"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="full-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <Navbar onNavClick={scrollToSection} />
            <main>
              <Hero />
              <Features />
              <CallToAction />
              <Footer />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
