import { Link } from "wouter"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <a className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            CodeDebug
          </a>
        </Link>
        
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/docs">Docs</Link>
          </Button>
          <Button asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
