
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

  const [currentMode, currentColor] = React.useMemo(() => {
    if (theme === 'system') {
        return ['system', 'zinc']; // Default color for system
    }
    const [mode, color] = theme?.split('-') || [];
    return [mode || 'light', color || 'zinc'];
  }, [theme]);

  const handleThemeChange = (newComponent: string, type: 'mode' | 'color') => {
    if (type === 'mode') {
      if (newComponent === 'system') {
        setTheme('system');
        return;
      }
      // When switching mode, we need to know the current color.
      const color = theme?.includes('-') ? theme.split('-')[1] : 'zinc';
      setTheme(`${newComponent}-${color}`);
    } else {
      // When changing color, respect the current mode (light/dark)
      // If currentMode is system, use the resolvedTheme to determine light/dark
      const mode = currentMode === 'system' ? resolvedTheme : currentMode;
      setTheme(`${mode}-${newComponent}`);
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
