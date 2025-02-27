import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

export function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative z-10">
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
          className="text-sm font-medium text-primary mb-4"
        >
          Available now
        </motion.p>

        <motion.h1 
          className="text-5xl sm:text-7xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Advanced AI-Powered
          </span>
          <br />
          <span className="text-white">Code Debugging</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mt-4"
        >
          Streamline your debugging process with powerful AI analysis and real-time insights
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center pt-8"
        >
          <Button 
            size="lg" 
            className="h-12 px-8 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0"
            asChild
          >
            <Link href="/home">Get Started</Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-12 px-8 text-base border-zinc-700 hover:bg-zinc-800/50 text-zinc-300"
            asChild
          >
            <a href="https://github.com/DragAditya" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}