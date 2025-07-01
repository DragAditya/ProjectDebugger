import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        theme-toggle
        ${theme === "dark" ? "data-[state=checked]" : ""}
      `}
      data-state={theme === "dark" ? "checked" : "unchecked"}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="theme-toggle-thumb">
        {theme === "dark" ? (
          <Moon className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}
