"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Feather, Moon, Cloud, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WritingDesk } from "@/components/writing-desk"
import { Mailbox } from "@/components/mailbox"

export default function Home() {
  const [showWritingDesk, setShowWritingDesk] = useState(false)
  const [showMailbox, setShowMailbox] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden grainy-texture">
      {/* Deep radial gradient - Dark Blue to Black */}
      <div className="fixed inset-0 bg-gradient-to-br from-[hsl(222,47%,11%)] via-[hsl(217,33%,17%)] to-black" />

      {/* Additional radial gradient for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(199,89%,48%,0.08),transparent_50%)]" />

      {/* Fog overlay */}
      <div className="fixed inset-0 bg-gradient-to-t from-[hsl(217,33%,17%)]/50 via-transparent to-[hsl(222,47%,11%)]/30 pointer-events-none" />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {mounted &&
          [...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * -100 - 50],
                x: [null, Math.random() * 100 - 50],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {!showMailbox ? (
          // Hero Section
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-center max-w-4xl mx-auto space-y-8"
            >
              {/* Logo/Icon */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  <Feather className="w-16 h-16 text-slate-100" strokeWidth={1.5} />
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute inset-0 blur-xl bg-white/30"
                  />
                </div>
              </motion.div>

              <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl text-white font-light tracking-tight text-balance">
                Some words need time to travel.
              </h1>

              <p className="text-xl sm:text-2xl text-slate-100 font-medium tracking-wide text-pretty max-w-2xl mx-auto leading-relaxed">
                Send anonymous letters into the void.
                <br />
                Receive thoughts from a stranger.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Button
                  onClick={() => setShowWritingDesk(true)}
                  size="lg"
                  className="group relative bg-slate-950/80 hover:bg-slate-950/90 text-white border border-white/10 backdrop-blur-xl px-8 py-6 text-lg font-serif shadow-2xl transition-all duration-300 hover:shadow-white/20 hover:border-white/40"
                >
                  <span className="flex items-center gap-3">
                    <Feather className="w-5 h-5" />
                    Pick up the Quill
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 blur-sm"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </Button>

                <Button
                  onClick={() => setShowMailbox(true)}
                  size="lg"
                  variant="ghost"
                  className="text-white/90 hover:text-white hover:bg-slate-950/60 backdrop-blur-sm px-8 py-6 text-lg border border-white/10 font-serif"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Open Mailbox
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 pt-12 text-white/60">
                <motion.div
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Moon className="w-6 h-6" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                >
                  <Cloud className="w-6 h-6" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Mailbox View
          <Mailbox onBack={() => setShowMailbox(false)} />
        )}
      </div>

      {/* Writing Desk Modal */}
      <AnimatePresence>{showWritingDesk && <WritingDesk onClose={() => setShowWritingDesk(false)} />}</AnimatePresence>
    </div>
  )
}
