"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getArrivedLetters, type Letter as SupabaseLetter } from "@/services/letter-service"

interface MailboxProps {
  onBack: () => void
}

interface Letter {
  id: string
  mood: string
  preview: string
  content: string
  status: "arrived" | "opened"
  arrivalTime: string
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return "Just arrived"
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
}

function transformLetter(letter: SupabaseLetter): Letter {
  return {
    id: letter.id,
    mood: letter.mood,
    preview: letter.content.slice(0, 50) + (letter.content.length > 50 ? "..." : ""),
    content: letter.content,
    status: "arrived",
    arrivalTime: formatRelativeTime(letter.delivery_at),
  }
}

export function Mailbox({ onBack }: MailboxProps) {
  const [letters, setLetters] = useState<Letter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)

  useEffect(() => {
    async function fetchLetters() {
      setIsLoading(true)
      const arrivedLetters = await getArrivedLetters()
      setLetters(arrivedLetters.map(transformLetter))
      setIsLoading(false)
    }
    fetchLetters()
  }, [])

  const openLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    // Mark as opened
    setLetters(letters.map((l) => (l.id === letter.id ? { ...l, status: "opened" as const } : l)))
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white/70 hover:text-white mb-6 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-5xl sm:text-6xl font-serif text-white mb-3">Your Mailbox</h1>
          <p className="text-slate-200 text-lg leading-relaxed font-medium">
            Letters from the void, arriving in their own time.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-black/70 border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-24 bg-slate-800" />
                  <Skeleton className="h-8 w-8 rounded-full bg-slate-800" />
                </div>
                <Skeleton className="h-8 w-8 mb-4 bg-slate-800" />
                <Skeleton className="h-4 w-full mb-2 bg-slate-800" />
                <Skeleton className="h-4 w-3/4 mb-4 bg-slate-800" />
                <Skeleton className="h-3 w-20 bg-slate-800" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => openLetter(letter)}
                  className="relative overflow-hidden backdrop-blur-xl border-white/10 p-6 transition-all duration-300 group bg-black/70 cursor-pointer hover:bg-slate-950/80 hover:border-white/30 hover:shadow-lg hover:shadow-white/10"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    {/* Status indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-serif px-3 py-1 rounded-full border font-medium bg-white/10 text-white border-white/30">
                        {letter.mood}
                      </span>

                      {letter.status === "arrived" && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="w-8 h-8 rounded-full bg-destructive/80 border-2 border-destructive flex items-center justify-center shadow-lg"
                          title="Unread - Wax Seal"
                        >
                          <div className="w-2 h-2 rounded-full bg-foreground/80" />
                        </motion.div>
                      )}
                    </div>

                    {/* Letter icon */}
                    <div className="mb-4">
                      <Mail className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                    </div>

                    <p className="font-mono text-base mb-4 line-clamp-2 leading-relaxed font-medium text-white/90">
                      {letter.preview}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{letter.arrivalTime}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && letters.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Mail className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg font-serif leading-relaxed">
              Your mailbox is empty. Letters will arrive in time...
            </p>
          </motion.div>
        )}
      </div>

      {/* Letter reading modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-lg"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl"
            >
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 bg-white/[0.02] pointer-events-none rounded-2xl" />

              <div className="relative">
                {/* Mood tag */}
                <div className="mb-6">
                  <span className="text-xs font-serif px-3 py-1 rounded-full border bg-white/10 text-white border-white/30 font-medium">
                    {selectedLetter.mood}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none mb-8">
                  <p className="font-mono text-white/90 leading-relaxed whitespace-pre-line text-lg font-medium">
                    {selectedLetter.content}
                  </p>
                </div>

                {/* Close button */}
                <Button
                  onClick={() => setSelectedLetter(null)}
                  variant="ghost"
                  className="text-white/70 hover:text-white w-full sm:w-auto border border-white/20 hover:border-white/40 transition-colors"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
