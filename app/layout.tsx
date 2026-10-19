import type { Metadata, Viewport } from "next"
import { Fraunces, Noto_Sans_Devanagari, Outfit } from "next/font/google"
import { AppShell } from "@/components/app-shell"
import { PreferencesProvider } from "@/components/preferences"
import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kamra — find a room, flat or PG",
  description:
    "Chat-first room, flat and PG finder for Delhi NCR and other Indian cities. Kamra searches public listings, links to the original page, and takes no commission.",
  applicationName: "Kamra",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Kamra",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1814" },
  ],
  width: "device-width",
  initialScale: 1,
}

const themeBoot = `(function(){try{var t=localStorage.getItem("kamra.theme");var dark=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");var l=localStorage.getItem("kamra.lang");if(l==="hi")document.documentElement.lang="hi";}catch(e){}})();`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${fraunces.variable} ${devanagari.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <PreferencesProvider>
          <AppShell>{children}</AppShell>
          <PwaRegister />
        </PreferencesProvider>
      </body>
    </html>
  )
}
