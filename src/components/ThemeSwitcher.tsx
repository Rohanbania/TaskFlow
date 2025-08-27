
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

const COLOR_THEMES = ['zinc', 'orange', 'rose', 'blue'];

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  const [currentMode, currentColor] = React.useMemo(() => {
    if (theme === 'system') {
        return ['system', 'zinc'];
    }
    const [mode = 'light', color = 'zinc'] = theme?.split('-') || [];
    return [mode, color];
  }, [theme]);

  const handleThemeChange = (newComponent: string, type: 'mode' | 'color') => {
    if (currentMode === 'system' && type === 'mode') {
        setTheme(newComponent);
        return;
    }
    const newTheme = type === 'mode' 
      ? `${newComponent}-${currentColor}` 
      : `${currentMode}-${newComponent}`;
    setTheme(newTheme);
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
        <DropdownMenuItem onClick={() => handleThemeChange('light', 'mode')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark', 'mode')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color</DropdownMenuLabel>
        {COLOR_THEMES.map((color) => (
          <DropdownMenuItem
            key={color}
            onClick={() => handleThemeChange(color, 'color')}
            className="capitalize"
          >
            {color}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
