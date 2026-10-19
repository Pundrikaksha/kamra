import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kamra — rooms, flats and PGs",
    short_name: "Kamra",
    description: "Find a room, flat or PG in Delhi NCR and other Indian cities.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#9a3b2b",
    lang: "en-IN",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
