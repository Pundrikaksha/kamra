# Kamra

Kamra is a chat-first room, flat, and PG finder for Delhi NCR (Delhi, Noida, Gurgaon) and other major Indian cities.

You describe what you need in English, Hindi, or Hinglish. Kamra turns that into a short requirement, searches public listing sites, and shows a ranked shortlist with a one-line reason and a risk badge. When you want to talk to an owner, it drafts a message. **You approve it.** Kamra never sends the message, never pays anyone, and never takes a commission.

Links always go to the original site. Kamra does not scrape listing sites and does not keep a database of copied ads. Demo mode, used when no API key is set, shows sample cards written for this app.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` only if you want live search:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | For live search | Gemini API key. Stays on the server. |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash`. |
| `GOOGLE_CSE_KEY` | No | Programmable Search JSON API key. Used only together with `GOOGLE_CSE_CX`. |
| `GOOGLE_CSE_CX` | No | Programmable Search engine id. Restrict the engine to listing sites if you can. Kamra still drops hosts it does not recognise. |

With no key, the app is in **demo mode**. The shortlist is labelled as sample cards.

```bash
npm test
npm run build
npm start
```

## What the app does

1. One conversation. Type, or use the mic where the browser supports the Web Speech API.
2. Kamra fills city, area, budget, type (flat, PG, flat share, room), BHK, furnishing, who it’s for, move-in, and commute. It asks at most two follow-ups, as chips.
3. Live search calls Gemini with Google Search grounding, limited by the prompt to listing sites (NoBroker, Magicbricks, 99acres, Housing.com, Square Yards, NestAway, Flatmate, OLX, Zolo, Stanza Living, and public Facebook links when the result is on that host). Optional Programmable Search is merged in. Only search snippets and grounding links are used. Cards link out.
4. Cards are scored for budget, place, and type. Risk badges flag broker language, prices far below a rough area band, token or visiting-charge language, and the same place appearing on two sites.
5. **Contact for me** drafts a Hindi or English note. You edit it, tick approval, then open the listing, WhatsApp, or SMS with the text filled in.
6. A “before you pay” checklist covers tokens, owner ID, and the Uttar Pradesh two-month deposit cap (Noida). Visit notes and saved searches live in `localStorage` on the phone, with a re-run button. An optional email is stored on the device only. Nothing is emailed.

UI languages: English and Hindi. Light and dark themes. A web app manifest is included so Android can add Kamra to the home screen.

There is no analytics.

## Deploy on Vercel

This project is a Next.js App Router app. Vercel detects that.

1. In Vercel, create a project and import this Git repository (the Origin remote this repo already uses).
2. Framework preset: **Next.js**. Build command: `npm run build`. Output: leave the default.
3. Add environment variables if you want live search: `GEMINI_API_KEY`, and optionally `GEMINI_MODEL`, `GOOGLE_CSE_KEY`, `GOOGLE_CSE_CX`. Leave them empty to ship demo mode.
4. Deploy. No database and no extra account inside this repo.

The Gemini key is read only in server route handlers. Do not prefix it with `NEXT_PUBLIC_`.

## Deploy on Firebase App Hosting or Cloud Run

**Firebase App Hosting.** `apphosting.yaml` sets a small Cloud Run shape. Connect the repository in Firebase App Hosting, use the Node build (`npm run build`), and set `GEMINI_API_KEY` in the environment if you want live search. Demo mode deploys with no secrets.

**Cloud Run.** From a machine where Docker and `gcloud` are already set up:

```bash
gcloud run deploy kamra --source . --region asia-south1 --allow-unauthenticated
```

The `Dockerfile` builds Next.js and listens on port `8080`. Set `GEMINI_API_KEY` on the Cloud Run service for live search. The same image works without the key, in demo mode.

## Limits and safety

- About 16 API calls per IP every 10 minutes, held in memory on that server instance.
- Chat text is capped at 600 characters.
- Search snippets are truncated and are not sent back to the model as instructions.
- A model reply that adds a payment link or a token demand is discarded. The plain template is used instead.
- Religion and caste are not fields, even if someone types them.

Risk badges are hints, not verification. Kamra is not a lawyer and not a broker.

## License

MIT. See [LICENSE](LICENSE).
