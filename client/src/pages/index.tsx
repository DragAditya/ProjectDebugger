import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Typewriter } from "@/components/ui/typewriter";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-7xl px-4">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight">
          <Typewriter
            text={[
              "Welcome to Code Analysis Platform",
              "Debug Smarter, Code Better",
              "AI-Powered Code Intelligence"
            ]}
            speed={100}
            loop={true}
            className="text-primary"
          />
        </h1>
        <div className="flex justify-center">
          <InteractiveHoverButton text="Get Started" />
        </div>
      </div>
    </div>
  );
}