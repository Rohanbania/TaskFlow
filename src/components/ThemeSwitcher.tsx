"use client"

import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const COLOR_THEMES = ['zinc', 'orange', 'green', 'blue', 'rose', 'violet'];

export function ThemeSwitcher() {
  const { setTheme: setMode, resolvedTheme } = useTheme()
  const [colorTheme, setColorTheme] = React.useState<string>('zinc');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("color-theme");
    if (storedTheme && COLOR_THEMES.includes(storedTheme)) {
      setColorTheme(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.remove(...COLOR_THEMES.map(t => `theme-${t}`));
    document.documentElement.classList.add(`theme-${colorTheme}`);
    localStorage.setItem("color-theme", colorTheme);
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
