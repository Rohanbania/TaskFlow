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
const LOCAL_STORAGE_COLOR_KEY = 'color-theme';

export function ThemeSwitcher() {
  const { setTheme: setMode, theme: mode } = useTheme();
  const [colorTheme, setColorTheme] = React.useState<string>('');

  React.useEffect(() => {
    // On mount, read the color theme from local storage
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_COLOR_KEY);
    if (storedTheme && COLOR_THEMES.includes(storedTheme)) {
        setColorTheme(storedTheme);
    } else {
        setColorTheme('zinc');
    }
  }, []);

  React.useEffect(() => {
    // When colorTheme state changes, update the class on the <html> element
    const root = window.document.documentElement;
    
    // Remove any existing theme- classes
    root.classList.remove(...COLOR_THEMES.map(t => `theme-${t}`));

    if (colorTheme) {
      root.classList.add(`theme-${colorTheme}`);
      localStorage.setItem(LOCAL_STORAGE_COLOR_KEY, colorTheme);
    }
  }, [colorTheme]);

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
            onClick={() => setColorTheme(theme)}
            className="capitalize"
          >
            {theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
