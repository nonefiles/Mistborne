"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendLetter } from "@/services/letter-service"
import { useToast } from "@/hooks/use-toast"

interface WritingDeskProps {
  onClose: () => void
}

const moods = ["Melancholic", "Hopeful", "Lost", "Grateful", "Reflective", "Longing"]

export function WritingDesk({ onClose }: WritingDeskProps) {
  const [letter, setLetter] = useState("")
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (!letter.trim() || !selectedMood) return

    setIsSending(true)

    const result = await sendLetter(letter, selectedMood)

    setIsSending(false)

    if (result.success) {
      setSent(true)
      toast({
        title: "Your letter has begun its journey.",
        description: "It has been delivered to the void immediately.",
      })

      setTimeout(() => {
        onClose()
        setSent(false)
        setLetter("")
        setSelectedMood(null)
      }, 2700)
    } else {
      toast({
        title: "Failed to send letter",
        description: result.error || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl"
      >
        <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />

          {/* Glow effect */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <div className="relative p-8 sm:p-12">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10 border border-white/10 hover:border-white/30"
            >
              <X className="w-5 h-5" />
            </button>

            {!sent ? (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-serif text-white mb-2">The Writing Desk</h2>
                  <p className="text-white/80 text-base leading-relaxed">
                    Your words will drift through time before reaching someone...
                  </p>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-white/90 mb-3 block font-serif font-medium">
                    What is the mood of your letter?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`px-4 py-2 rounded-full text-sm font-serif transition-all font-medium text-white border-2 ${
                          selectedMood === mood
                            ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-white/10"
                            : "border-transparent bg-transparent"
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    placeholder="Begin your letter..."
                    className="w-full h-64 bg-slate-900 border border-white/10 rounded-xl p-6 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 resize-none font-mono text-lg leading-relaxed shadow-inner"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                    <span className="font-medium">{letter.length} characters</span>
                    <span>No rush. Take your time.</span>
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!letter.trim() || !selectedMood || isSending}
                  className="w-full bg-slate-950/80 hover:bg-slate-950/90 text-white border border-white/10 backdrop-blur-xl py-6 text-lg font-serif shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Sending to the void...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                      Send to the Unknown
                    </>
                  )}
                </Button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: 1,
                  y: [0, -100],
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut",
                }}
                className="py-12 text-center"
              >
                <motion.div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Send className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-serif text-white mb-2">Letter sent</h3>
                <p className="text-white/90">Your words are now drifting through the void...</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
