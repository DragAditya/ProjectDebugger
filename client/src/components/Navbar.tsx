import { Link } from "wouter"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center">
        <div className="flex-1 flex items-center">
          <Link href="/">
            <a className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent mr-4">
              CodeDebug
            </a>
          </Link>
          <span className="text-sm text-muted-foreground">username</span>
        </div>
        
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
