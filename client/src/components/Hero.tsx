import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

export function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl space-y-4"
      >
        <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          Advanced AI-Powered Code Debugging
        </h1>
        <p className="text-lg text-muted-foreground">
          Streamline your debugging process with powerful AI analysis and real-time insights
        </p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center pt-8"
        >
          <Button size="lg" asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs">Documentation</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
