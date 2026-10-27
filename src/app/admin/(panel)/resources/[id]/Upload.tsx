"use client";

import { useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { createUpload } from "../../../actions";

export type Uploaded = { url: string; fileName: string; size: number; width?: number; height?: number };

function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return Promise.resolve({});
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({});
    img.src = url;
  });
}

export function UploadButton({
  accept,
  label = "העלאת קובץ",
  onUploaded,
}: {
  accept?: string;
  label?: string;
  onUploaded: (file: Uploaded) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading">("idle");
  const [error, setError] = useState("");

  async function handle(file: File) {
    setError("");
    setState("uploading");
    try {
      const signed = await createUpload({ fileName: file.name, contentType: file.type, size: file.size });
      if (!signed.ok) throw new Error(signed.error);
      const { error: upErr } = await createBrowserSupabase()
        .storage.from("media")
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || undefined, cacheControl: "31536000" });
      if (upErr) throw new Error(upErr.message);
      onUploaded({ url: signed.publicUrl, fileName: file.name, size: file.size, ...(await imageSize(file)) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "ההעלאה נכשלה");
    } finally {
      setState("idle");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <button type="button" className="btn" disabled={state === "uploading"} onClick={() => input.current?.click()}>
        {state === "uploading" ? "מעלה…" : label}
      </button>
      {error && (
        <span role="alert" className="text-[13px] font-bold text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
