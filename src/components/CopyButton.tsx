"use client";

import { useState } from "react";

export function CopyButton({ text, label = "העתק" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      // Clipboard can be blocked (old browsers, in-app webviews). Fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setState(ok ? "done" : "failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
      {state === "done" ? "הועתק ✓" : state === "failed" ? "סמן והעתק ידנית" : label}
    </button>
  );
}
