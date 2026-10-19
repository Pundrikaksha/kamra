import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy — Kamra",
  description: "What Kamra stores, and what it does not.",
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 text-sm leading-6">
      <h1 className="font-heading text-4xl">Privacy</h1>
      <p className="text-muted-foreground">प्राइवेसी</p>
      <p>
        Kamra is a search helper. It is not a broker, and it does not take a commission. Listing links go to third-party
        sites such as NoBroker, Magicbricks, 99acres, Housing.com, and others. Those sites have their own privacy
        policies. Kamra does not control them.
      </p>
      <p>
        कमरा एक खोज सहायक है। यह दलाल नहीं है और कमीशन नहीं लेता। लिस्टिंग के लिंक तीसरे पक्ष की साइटों पर जाते हैं। उन
        साइटों की अपनी प्राइवेसी नीति होती है।
      </p>
      <h2 className="pt-2 font-heading text-2xl">What stays on your phone</h2>
      <p>
        Saved searches, visit notes, the language, the theme, and an optional email address are stored in this
        browser’s localStorage. The email is not sent anywhere. Kamra does not run analytics and does not sell data.
      </p>
      <h2 className="pt-2 font-heading text-2xl">What the server sees</h2>
      <p>
        When you search, the server receives the words you typed and the structured requirement, long enough to call
        Google Search through Gemini or, if you configured it, Programmable Search. Snippets are treated as untrusted
        data. Kamra does not keep a database of copied listings. Rate limiting uses your IP address in memory for a few
        minutes and then drops it.
      </p>
      <p>
        Live search needs a Gemini API key on the server. That key is never sent to the browser. Demo mode uses sample
        cards written for Kamra when no key is set.
      </p>
      <h2 className="pt-2 font-heading text-2xl">Messages</h2>
      <p>
        “Contact for me” drafts a message on the server. Nothing is sent until you approve it. Approving opens the
        original listing, WhatsApp, or your SMS app. Kamra does not message the owner and does not pay anyone.
      </p>
      <p>
        <Link href="/" className="underline">
          Back to Kamra
        </Link>
      </p>
    </article>
  )
}
