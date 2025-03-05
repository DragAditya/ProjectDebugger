import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-fit min-w-[140px] cursor-pointer overflow-hidden rounded-full border border-primary bg-background px-4 py-2 text-center font-medium text-sm transition-colors hover:text-primary-foreground",
        className
      )}
      {...props}
    >
      <span className="block translate-x-0 transition-transform duration-300 group-hover:translate-x-[150px] group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute inset-0 flex translate-x-[100px] items-center justify-center gap-2 transition-transform duration-300 group-hover:translate-x-0">
        <span>{text}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
      <div 
        className="absolute left-[20%] top-[40%] h-2 w-2 rounded-full bg-primary opacity-100 transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:opacity-100"
      />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };