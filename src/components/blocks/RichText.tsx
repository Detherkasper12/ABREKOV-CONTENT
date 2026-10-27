import { Fragment, type ReactNode } from "react";
import { safeUrl } from "@/lib/blocks";

// A tiny, safe Markdown subset for Text blocks: paragraphs, "- " and "1. " lists,
// **bold**, `code` and [links](https://...). Output is React elements, never raw HTML.
const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={key}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = link[2];
      if (!safeUrl.safeParse(href).success) return <Fragment key={key}>{link[1]}</Fragment>;
      const external = /^https?:/i.test(href);
      return (
        <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

function withBreaks(text: string, keyBase: string) {
  return text.split("\n").map((line, i) => (
    <Fragment key={`${keyBase}-l${i}`}>
      {i > 0 && <br />}
      {inline(line, `${keyBase}-l${i}`)}
    </Fragment>
  ));
}

export function RichText({ text }: { text: string }) {
  const chunks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).filter((c) => c.trim());
  return (
    <div className="prose">
      {chunks.map((chunk, ci) => {
        const lines = chunk.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={ci}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ""), `${ci}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={ci}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""), `${ci}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={ci}>{withBreaks(chunk, String(ci))}</p>;
      })}
    </div>
  );
}
