
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
  const { setTheme, theme, resolvedTheme } = useTheme()

  const handleThemeChange = (newComponent: string, type: 'mode' | 'color') => {
    let newTheme = '';
    if (type === 'mode') {
      if (newComponent === 'system') {
        newTheme = 'system';
      } else {
        const currentColor = theme?.split('-')[1] || 'zinc';
        newTheme = `${newComponent}-${currentColor}`;
      }
    } else { // type === 'color'
      const currentMode = theme === 'system' ? resolvedTheme : (theme?.split('-')[0] || 'light');
      newTheme = `${currentMode}-${newComponent}`;
    }
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
        <DropdownMenuItem onClick={() => handleThemeChange('system', 'mode')}>
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
