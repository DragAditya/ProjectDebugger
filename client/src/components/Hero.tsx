import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { Waves } from "@/components/waves-background"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

export function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative z-10">
      <Waves 
        lineColor="hsl(var(--foreground) / 0.8)"
        backgroundColor="hsl(var(--background) / 0.5)"
        waveSpeedX={0.015}
        waveSpeedY={0.01}
        xGap={12}
        yGap={24}
        className="z-[-1]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-orange-500 mb-4"
        >
          Made By Aditya
        </motion.p>

        <motion.h1 
          className="text-5xl sm:text-7xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-[#FCA311] to-orange-300 bg-clip-text text-transparent">
            Advanced AI-Powered
          </span>
          <br />
          <span className="text-foreground">Code Debugging</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mt-4"
        >
          Streamline your debugging process with powerful AI analysis and real-time insights
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center pt-8"
        >
          <Link href="/auth">
            <InteractiveHoverButton 
              text="GO" 
              className="border-[#14213D] text-foreground" 
            />
          </Link>
          <a href="https://github.com/DragAditya" target="_blank" rel="noopener noreferrer">
            <InteractiveHoverButton text="Docs" className="border-[#14213D] text-foreground" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}