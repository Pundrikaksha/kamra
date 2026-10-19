"use client"

import Link from "next/link"
import { Bookmark, Moon, Sun } from "lucide-react"
import { usePreferences } from "@/components/preferences"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import { getCopy } from "@/lib/i18n"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, theme, setTheme } = usePreferences()
  const t = getCopy(lang)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-heading text-lg text-primary-foreground">
              क
            </span>
            <span>
              <span className="block font-heading text-[1.35rem] leading-none tracking-tight">Kamra</span>
              <span className="text-xs text-muted-foreground">{t.tagline}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <div className="mr-1 flex rounded-lg border border-border p-0.5">
              <Button
                type="button"
                size="xs"
                variant={lang === "en" ? "default" : "ghost"}
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
              >
                EN
              </Button>
              <Button
                type="button"
                size="xs"
                variant={lang === "hi" ? "default" : "ghost"}
                onClick={() => setLang("hi")}
                aria-pressed={lang === "hi"}
              >
                हिं
              </Button>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Link href="/saved" aria-label={t.savedTitle} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
              <Bookmark />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground">
        <p>{t.notBroker}</p>
        <p className="mt-1 flex justify-center gap-3">
          <Link href="/privacy" className="underline underline-offset-2">
            {t.privacy}
          </Link>
          <Link href="/terms" className="underline underline-offset-2">
            {t.terms}
          </Link>
        </p>
      </footer>
    </div>
  )
}
