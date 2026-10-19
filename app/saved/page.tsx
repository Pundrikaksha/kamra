import type { Metadata } from "next"
import { SavedScreen } from "@/components/saved-screen"

export const metadata: Metadata = {
  title: "Saved searches and visits — Kamra",
  description: "Searches and visit notes stored on this phone.",
}

export default function SavedPage() {
  return <SavedScreen />
}
