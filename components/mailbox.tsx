"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mail, Clock, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getArrivedLetters, reactToLetter, type Letter as SupabaseLetter } from "@/services/letter-service"
import { useToast } from "@/hooks/use-toast"

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
  reactions: {
    fire: number
  }
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
    reactions: letter.reactions || { fire: 0 },
  }
}

export function Mailbox({ onBack }: MailboxProps) {
  const [letters, setLetters] = useState<Letter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [reactedLetterIds, setReactedLetterIds] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchLetters() {
      setIsLoading(true)
      const arrivedLetters = await getArrivedLetters()
      setLetters(arrivedLetters.map(transformLetter))
      setIsLoading(false)
    }
    fetchLetters()

    // Load reacted letters from localStorage
    const saved = localStorage.getItem("mistborne_burned_letters")
    if (saved) {
      try {
        setReactedLetterIds(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse reacted letters:", e)
      }
    }
  }, [])

  const openLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    // Mark as opened
    setLetters(letters.map((l) => (l.id === letter.id ? { ...l, status: "opened" as const } : l)))
  }

  const handleReact = async (id: string) => {
    if (isReacting || reactedLetterIds.includes(id)) return
    setIsReacting(true)

    const result = await reactToLetter(id, "fire")

    if (result.success && result.fireCount !== undefined) {
      // Update local state
      const newReactedIds = [...reactedLetterIds, id]
      setReactedLetterIds(newReactedIds)
      localStorage.setItem("mistborne_burned_letters", JSON.stringify(newReactedIds))

      setLetters((prev) =>
        prev.map((l) => (l.id === id ? { ...l, reactions: { ...l.reactions, fire: result.fireCount! } } : l)),
      )
      if (selectedLetter && selectedLetter.id === id) {
        setSelectedLetter((prev) =>
          prev ? { ...prev, reactions: { ...prev.reactions, fire: result.fireCount! } } : null,
        )
      }

      toast({
        title: "Flame Kindled",
        description: "Your warmth has reached them.",
      })
    } else {
      toast({
        title: "Failed to light flame",
        description: result.error || "Something went wrong.",
        variant: "destructive",
      })
    }

    setIsReacting(false)
  }

  const hasReacted = selectedLetter ? reactedLetterIds.includes(selectedLetter.id) : false

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

                {/* Vigil Flame Reaction */}
                <div className={`mb-10 p-6 rounded-xl border text-center relative overflow-hidden group/flame transition-colors duration-500 ${hasReacted ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-500/5 border-orange-500/10"}`}>
                  {/* Mystic background glow */}
                  <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_70%)] transition-opacity duration-700 ${hasReacted ? "opacity-100" : "opacity-0 group-hover/flame:opacity-100"}`} />

                  <p className={`text-sm font-serif mb-4 italic transition-colors duration-500 ${hasReacted ? "text-orange-200" : "text-orange-200/70"}`}>
                    {hasReacted ? "Your flame already burns for this soul." : "If you hear this soul, light a flame in the void."}
                  </p>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => handleReact(selectedLetter.id)}
                      disabled={isReacting || hasReacted}
                      className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 border transition-all duration-500 group active:scale-95 disabled:opacity-100 ${
                        hasReacted 
                          ? "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.6)] text-orange-500" 
                          : "border-orange-500/30 text-orange-500 hover:scale-110 hover:border-orange-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                      }`}
                    >
                      <Flame
                        className={`w-8 h-8 transition-all duration-500 ${
                          isReacting ? "animate-pulse" : 
                          hasReacted ? "fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" : 
                          "group-hover:fill-orange-500 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                        }`}
                      />
                      {/* Animated outer rings */}
                      <div className={`absolute inset-0 rounded-full border border-orange-500/20 transition-all duration-1000 ${hasReacted ? "scale-125 opacity-0" : "scale-100 group-hover:scale-150 group-hover:opacity-0"}`} />
                    </button>

                    <div className="flex items-center gap-2 text-orange-200/50 text-xs font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full bg-orange-500/50 ${hasReacted ? "animate-none scale-125" : "animate-pulse"}`} />
                      <span>{hasReacted ? "Eternal" : `${selectedLetter.reactions.fire} flames burning`}</span>
                    </div>
                  </div>
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
