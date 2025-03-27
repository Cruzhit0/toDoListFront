import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export type ThemeMode = "light" | "dark"
export type AccentColor = "blue" | "purple" | "teal" | "amber" | "rose"

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private themeModeSubject = new BehaviorSubject<ThemeMode>(this.getInitialTheme())
  themeMode$ = this.themeModeSubject.asObservable()

  private accentColorSubject = new BehaviorSubject<AccentColor>(this.getStoredAccentColor())
  accentColor$ = this.accentColorSubject.asObservable()

  get currentTheme(): string {
    return this.themeModeSubject.value
  }

  get currentAccent(): AccentColor {
    return this.accentColorSubject.value
  }

  constructor() {
    // Initialize theme
    this.applyTheme(this.themeModeSubject.value)
    this.applyAccentColor(this.accentColorSubject.value)

    // Watch for system theme changes
    this.watchSystemTheme()
  }

  toggleTheme(): void {
    const newTheme = this.themeModeSubject.value === "light" ? "dark" : "light"
    this.setTheme(newTheme)
  }

  setTheme(theme: ThemeMode): void {
    this.themeModeSubject.next(theme)
    localStorage.setItem("theme", theme)
    this.applyTheme(theme)
  }

  setAccentColor(color: AccentColor): void {
    this.accentColorSubject.next(color)
    localStorage.setItem("accentColor", color)
    this.applyAccentColor(color)
  }

  private getInitialTheme(): ThemeMode {
    // Check local storage
    const storedTheme = localStorage.getItem("theme") as ThemeMode
    if (storedTheme) {
      return storedTheme
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark"
    }

    return "light"
  }

  private getStoredAccentColor(): AccentColor {
    return (localStorage.getItem("accentColor") as AccentColor) || "blue"
  }

  private applyTheme(theme: ThemeMode): void {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  private applyAccentColor(color: AccentColor): void {
    // Remove existing accent classes
    document.documentElement.classList.remove(
      "accent-blue",
      "accent-purple",
      "accent-teal",
      "accent-amber",
      "accent-rose",
    )

    // Add new accent class
    document.documentElement.classList.add(`accent-${color}`)
  }

  private watchSystemTheme(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = (e: MediaQueryListEvent) => {
        // Only change if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light")
        }
      }

      // Add listener for theme changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      }
    }
  }
}

