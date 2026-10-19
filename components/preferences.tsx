"use client"

import { createContext, useContext, useSyncExternalStore } from "react"
import { LANG_KEY, THEME_KEY } from "@/lib/storage"
import type { Lang } from "@/lib/types"

type Theme = "light" | "dark"

type Preferences = {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const PreferencesContext = createContext<Preferences | null>(null)

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY)
  return stored === "hi" ? "hi" : "en"
}

function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "dark" || stored === "light") return stored
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang)
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme)

  function setLang(next: Lang) {
    localStorage.setItem(LANG_KEY, next)
    document.documentElement.lang = next === "hi" ? "hi" : "en"
    emit()
  }

  function setTheme(next: Theme) {
    localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle("dark", next === "dark")
    emit()
  }

  return (
    <PreferencesContext.Provider value={{ lang, setLang, theme, setTheme }}>{children}</PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error("PreferencesProvider is missing")
  return value
}
