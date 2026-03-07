"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { HeroHighlight } from "@/components/aceternity/hero-highlight"

const cards = [
  { bg: "from-violet-500/60 to-indigo-600/60" },
  { bg: "from-rose-500/60 to-orange-500/60" },
  { bg: "from-emerald-500/60 to-teal-500/60" },
]

// Fan positions: left (-12°), center (0°), right (12°)
const positions = [
  { rotate: -12, x: -55, y: 14, z: 1 },
  { rotate: 0, x: 0, y: -14, z: 2 },
  { rotate: 12, x: 55, y: 14, z: 3 },
]

// Each card gets a slightly different float offset so they don't bob in sync
const floatDelays = [0, 0.8, 1.6]

export function Hero() {
  // Tracks which rotation of the card ordering we're on.
  // order[i] = which position index card i occupies.
  const [order, setOrder] = useState([0, 1, 2])

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prev) => [prev[2], prev[0], prev[1]])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <HeroHighlight containerClassName="items-center">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
        {/* Left column — copy */}
        <div className="flex flex-col justify-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="whitespace-nowrap">Your card game idea</span>{" "}
            deserves to exist.
          </h1>
          <p className="text-muted-foreground max-w-lg text-lg sm:text-xl">
            Design, manage, and print your card game, accelerated by AI.
          </p>
          <div className="flex gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/login">
                Get started
                <HugeiconsIcon icon={ArrowRight02Icon} data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right column — fanned card placeholders */}
        <div className="flex items-center justify-center lg:justify-end lg:-mr-32">
          <div className="relative top-36 h-[400px] w-[380px] sm:h-[480px] sm:w-[450px]">
            <AnimatePresence initial={false}>
              {cards.map((card, i) => {
                const pos = positions[order[i]]
                return (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute left-1/2 top-1/2 flex aspect-[2.5/3.5] w-[220px] items-center justify-center rounded-2xl border bg-gradient-to-br shadow-xl sm:w-[260px]",
                      "border-white/10 backdrop-blur-sm",
                      card.bg,
                    )}
                    animate={{
                      x: `calc(-50% + ${pos.x}px)`,
                      y: `calc(-50% + ${pos.y}px)`,
                      rotate: pos.rotate,
                      zIndex: pos.z,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 18,
                    }}
                    style={{ translateY: "-50%", translateX: "-50%" }}
                  >
                    {/* Floating idle animation layer */}
                    <motion.div
                      className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: floatDelays[i],
                      }}
                    >
                      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </HeroHighlight>
  )
}
