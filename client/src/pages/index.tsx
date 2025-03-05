import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex justify-center">
          <InteractiveHoverButton text="Click me" />
        </div>
      </div>
    </div>
  );
}