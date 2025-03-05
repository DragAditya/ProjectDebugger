import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative justify-center">
        <InteractiveHoverButton text="Click me" />
      </div>
    </div>
  );
}
