import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms — Kamra",
  description: "Kamra is not a broker and does not take a commission.",
}

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 text-sm leading-6">
      <h1 className="font-heading text-4xl">Terms</h1>
      <p className="text-muted-foreground">शर्तें</p>
      <p>
        Kamra helps you turn a sentence into a shortlist of public rental search results for Delhi NCR and other Indian
        cities. Kamra is not a broker, not an agent, and not a party to any rental. It takes no commission, token, or
        brokerage.
      </p>
      <p>
        कमरा आपकी बात से किराए की सार्वजनिक खोज की एक छोटी सूची बनाता है। कमरा दलाल नहीं है, किसी सौदे का पक्ष नहीं है,
        और कमीशन नहीं लेता।
      </p>
      <h2 className="pt-2 font-heading text-2xl">Links are other people’s listings</h2>
      <p>
        Cards link to third-party websites. Kamra does not scrape those sites and does not copy their listing content
        into a database. A snippet can be wrong, stale, or a broker pretending to be an owner. You have to open the
        original page and judge it yourself. Demo mode shows sample cards, clearly labelled, so the app can be tried
        without an API key.
      </p>
      <h2 className="pt-2 font-heading text-2xl">You send the message</h2>
      <p>
        Kamra can draft a note. It sends nothing and pays nothing on its own. You approve the text, then your browser
        opens the listing or your own WhatsApp or SMS app. Risk badges are hints from the words in a snippet and a
        rough rent band. They are not a verification, a guarantee, or legal advice.
      </p>
      <h2 className="pt-2 font-heading text-2xl">Deposits</h2>
      <p>
        In Uttar Pradesh, including Noida, residential deposits are generally capped at two months’ rent under the
        state’s tenancy law. Delhi and Haryana have not adopted that cap. Kamra only reminds you. It does not give
        legal advice.
      </p>
      <p>
        If you are cheated, call the national cyber-crime helpline on{" "}
        <a className="underline" href="tel:1930">
          1930
        </a>
        .
      </p>
      <p>
        <Link href="/" className="underline">
          Back to Kamra
        </Link>
      </p>
    </article>
  )
}
