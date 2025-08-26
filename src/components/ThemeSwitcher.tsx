"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const COLOR_THEMES = ['zinc', 'orange', 'rose'];

export function ThemeSwitcher() {
  const { setTheme: setMode } = useTheme()
  
  // Effect to set the color theme from localStorage on initial load
  React.useEffect(() => {
    const storedTheme = localStorage.getItem("color-theme");
    if (storedTheme && COLOR_THEMES.includes(storedTheme)) {
        document.documentElement.classList.add(`theme-${storedTheme}`);
    } else {
        // default to zinc if nothing is stored
        document.documentElement.classList.add('theme-zinc');
    }
  }, []);

  const handleColorChange = (theme: string) => {
    if (typeof window !== 'undefined') {
      // Remove all existing color theme classes
      COLOR_THEMES.forEach(t => {
        document.documentElement.classList.remove(`theme-${t}`);
      });
      // Add the new one
      document.documentElement.classList.add(`theme-${theme}`);
      // Save the choice to localStorage
      localStorage.setItem("color-theme", theme);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setMode("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("system")}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color</DropdownMenuLabel>
        {COLOR_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleColorChange(theme)}
            className="capitalize"
          >
            {theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
