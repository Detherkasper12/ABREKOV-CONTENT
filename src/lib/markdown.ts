import { newBlockId, type Block } from "./blocks";

// Resource ⇄ Markdown. Export gives visitors the whole resource as one file; import lets
// the admin start a resource from a .md file instead of building it block by block.

export function resourceToMarkdown(r: { title: string; description: string; blocks: Block[] }, pageUrl: string) {
  const abs = (url: string) => (url.startsWith("/") ? new URL(url, pageUrl).toString() : url);
  const out: string[] = [`# ${r.title}`];
  if (r.description) out.push(r.description);
  for (const b of r.blocks) {
    switch (b.type) {
      case "heading":
        if (b.text) out.push(`${b.level === 3 ? "###" : "##"} ${b.text}`);
        break;
      case "text":
        if (b.text) out.push(b.variant === "plain" ? b.text : b.text.split("\n").map((l) => `> ${l}`).join("\n"));
        break;
      case "image":
        if (b.url) out.push(`![${b.alt}](${abs(b.url)})${b.caption ? `\n${b.caption}` : ""}`);
        break;
      case "code":
      case "prompt": {
        const body = b.type === "code" ? b.code : b.text;
        if (!body) break;
        const fence = body.includes("```") ? "````" : "```";
        const lang = b.type === "code" ? b.language : "text";
        out.push(`${b.title ? `**${b.title}**\n\n` : ""}${fence}${lang}\n${body}\n${fence}`);
        break;
      }
      case "link":
        if (b.url) out.push(`[${b.title || b.url}](${abs(b.url)})${b.description ? ` — ${b.description}` : ""}`);
        break;
      case "file":
        if (b.url) out.push(`[${b.label || b.fileName || "הורדה"}](${abs(b.url)})`);
        break;
      case "video":
        if (b.url) out.push(`[${b.caption || "וידאו"}](${b.url})`);
        break;
      case "divider":
        out.push("---");
        break;
      case "cta":
        if (b.title || b.text) out.push([b.title && `**${b.title}**`, b.text, b.url && `[${b.buttonLabel || b.url}](${abs(b.url)})`].filter(Boolean).join("\n\n"));
        break;
    }
  }
  out.push(`---\n${pageUrl}`);
  return out.join("\n\n") + "\n";
}

export function markdownToResource(md: string): { title: string; description: string; blocks: Block[] } {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let title = "";
  let para: string[] = [];
  const flush = () => {
    const text = para.join("\n").trim();
    para = [];
    if (!text) return;
    const quote = text.split("\n").every((l) => l.startsWith(">"));
    blocks.push({
      id: newBlockId(),
      type: "text",
      text: quote ? text.replace(/^>\s?/gm, "") : text,
      variant: quote ? "tip" : "plain",
    });
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^(`{3,})\s*([\w+-]*)/);
    if (fence) {
      flush();
      const body: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith(fence[1]); i++) body.push(lines[i]);
      const lang = fence[2].toLowerCase();
      const code = body.join("\n");
      blocks.push(
        lang === "prompt" || lang === "text" || lang === ""
          ? { id: newBlockId(), type: "prompt", title: "", text: code }
          : { id: newBlockId(), type: "code", title: "", language: lang, code },
      );
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.+)/);
    if (h) {
      flush();
      if (h[1] === "#" && !title) title = h[2].trim();
      else blocks.push({ id: newBlockId(), type: "heading", text: h[2].trim(), level: h[1] === "###" ? 3 : 2 });
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      blocks.push({ id: newBlockId(), type: "divider" });
      continue;
    }
    if (!line.trim()) flush();
    else para.push(line);
  }
  flush();
  // The first plain paragraph right after the title doubles as the short description.
  let description = "";
  if (blocks[0]?.type === "text" && blocks[0].variant === "plain" && blocks[0].text.length <= 600 && !blocks[0].text.includes("\n")) {
    description = blocks[0].text;
    blocks.shift();
  }
  return { title, description, blocks };
}
