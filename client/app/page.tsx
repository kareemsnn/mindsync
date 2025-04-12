"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import CallToAction from "@/components/call-to-action";
import Footer from "@/components/footer";

// Gradient classes for different sections
const gradients = [
  "gradient-purple-indigo",
  "gradient-blue-teal",
  "gradient-pink-purple",
  "gradient-yellow-orange",
  "gradient-green-emerald"
];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [gradient, setGradient] = useState("");
  
  useEffect(() => {
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setGradient(randomGradient);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AnimatePresence>
        {!started ? (
          <motion.div
            key="start-screen"
            className={`flex flex-col items-center justify-center min-h-screen flowing-gradient ${gradient}`}
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
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all border border-white/20"
                onClick={() => setStarted(true)}
              >
                Start
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="full-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <Navbar onNavClick={scrollToSection} currentGradient={gradient} />
            <main>
              <Hero gradient={gradient} />
              <Features gradient={gradient} />
              <CallToAction gradient={gradient} />
              <Footer gradient={gradient} />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
