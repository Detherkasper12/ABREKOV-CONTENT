import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Per-guide access. A closed guide has a secret key (resources.access_key). The personal link
// /resources/<slug>/access?k=<key> checks it, stores it in an httpOnly cookie scoped to that guide,
// and redirects to the clean URL. Without the cookie the page renders a locked teaser only.
export const accessCookieName = (slug: string) => `ak_${slug}`;

export function keysMatch(given: string, key: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(key);
  return key !== "" && a.length === b.length && timingSafeEqual(a, b);
}

export async function hasAccess(r: { slug: string; accessKey: string }) {
  if (!r.accessKey) return true;
  const given = (await cookies()).get(accessCookieName(r.slug))?.value ?? "";
  return keysMatch(given, r.accessKey);
}
