import { checklistFor } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

export function Checklist({ lang, city }: { lang: Lang; city: string | null }) {
  const items = checklistFor(lang, city)
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-sm text-primary">
            {index + 1}
          </span>
          <span>
            <span className="block font-medium text-foreground">{item.title}</span>
            <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">{item.body}</span>
          </span>
        </li>
      ))}
      <li className="text-sm text-muted-foreground">
        <a className="underline underline-offset-2" href="tel:1930">
          1930
        </a>
      </li>
    </ol>
  )
}
