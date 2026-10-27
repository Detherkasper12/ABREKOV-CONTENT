// End-to-end smoke test of the core flow, run against a running server:
// log in → create → add text/code/image → publish → open public URL → edit → see change → unpublish.
//   BASE_URL=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/e2e-smoke.mjs
// Needs Playwright (npx playwright install chromium) and a database you don't mind writing test rows to.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// CommonJS require so a globally installed Playwright (NODE_PATH) also works.
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "password";
const SHOTS = process.env.SHOTS_DIR;
const slug = `e2e-${Date.now().toString(36)}`;

let failures = 0;
function check(name, ok, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
  if (!ok) failures++;
}

// 1x1 PNG for the upload test.
const png = join(tmpdir(), "e2e-test.png");
writeFileSync(png, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));

const browser = await chromium.launch();
const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// Public pages work without an account.
await page.goto(`${BASE}/`);
check("home lists seeded resources", (await page.getByRole("link", { name: /5 סקילים/ }).count()) > 0);
await page.goto(`${BASE}/resources/claude-skills`);
await page.getByRole("button", { name: "העתק" }).first().click();
const clip = await page.evaluate(() => navigator.clipboard.readText());
check("copy button copies install command", clip.startsWith("/plugin marketplace add"), clip.slice(0, 40));

// Admin is protected.
await page.goto(`${BASE}/admin`);
check("admin redirects to login when signed out", page.url().endsWith("/admin/login"));
await page.getByLabel("אימייל").fill(EMAIL);
await page.getByLabel("סיסמה").fill("wrong-password");
await page.getByRole("button", { name: "כניסה" }).click();
await page.locator("p[role=alert]").waitFor();
check("wrong password is rejected", (await page.locator("p[role=alert]").textContent()).includes("לא נכונים"));
check("email is kept after a failed login", (await page.getByLabel("אימייל").inputValue()) === EMAIL);
await page.getByLabel("סיסמה").fill(PASSWORD);
await page.getByRole("button", { name: "כניסה" }).click();
await page.waitForURL(`${BASE}/admin`);
check("login works", true);

// Create a resource and build it from blocks.
await page.getByRole("button", { name: "+ משאב חדש" }).click();
await page.waitForURL(/\/admin\/resources\/[0-9a-f-]{36}$/);
const editUrl = page.url();
await page.getByLabel("כותרת", { exact: true }).fill("משאב בדיקה");
await page.getByLabel("תיאור", { exact: true }).fill("תיאור לבדיקה");
await page.getByPlaceholder("claude-skills").fill(slug);
const addMenu = page.locator("div.border-dashed").last();
await addMenu.getByRole("button", { name: "טקסט", exact: true }).click();
await page.getByLabel("טקסט", { exact: true }).last().fill("שלום **עולם**\n\n- פריט ראשון\n- פריט שני");
await addMenu.getByRole("button", { name: "קוד", exact: true }).click();
await page.getByLabel("קוד", { exact: true }).last().fill("npm run dev");
await addMenu.getByRole("button", { name: "תמונה", exact: true }).click();
const chooser = page.waitForEvent("filechooser");
await page.locator("[data-block]").last().getByRole("button", { name: "העלאת תמונה" }).click();
await (await chooser).setFiles(png);
await page.locator('[data-block] img[src*="/storage/v1/object/public/media/"]').waitFor({ state: "attached", timeout: 15000 });
check("image upload stores file and shows preview", true);
await page.getByLabel("טקסט חלופי (לנגישות)").fill("פיקסל בדיקה");
// Reorder: move the image block to the top.
await page.getByRole("button", { name: "הזז למעלה" }).last().click();
await page.getByRole("button", { name: "הזז למעלה" }).nth(1).click();
const firstType = await page.locator("[data-block] span.font-mono").first().textContent();
check("reorder moves block up", firstType.includes("תמונה"), firstType);

await page.getByRole("button", { name: "שמירה" }).click();
await page.getByText("נשמר כטיוטה.").waitFor();
check("save draft", true);

// Draft is not public yet, but preview works.
const anon = await browser.newContext();
const anonPage = await anon.newPage();
let res = await anonPage.goto(`${BASE}/resources/${slug}`);
check("draft is not public", res.status() === 404, String(res.status()));
const pv = await page.context().newPage();
await pv.goto(`${editUrl}/preview`);
check("preview renders draft", (await pv.getByText("שלום").count()) > 0);
await pv.close();

await page.getByRole("button", { name: "פרסם" }).click();
await page.getByText("פורסם. הדף באוויר.").waitFor();
res = await anonPage.goto(`${BASE}/resources/${slug}`);
check("published page is public", res.status() === 200);
check("text block renders with markdown", (await anonPage.locator(".prose strong", { hasText: "עולם" }).count()) === 1);
check("list renders", (await anonPage.locator(".prose li").count()) === 2);
check("code block renders", (await anonPage.locator(".codebox pre", { hasText: "npm run dev" }).count()) === 1);
const imgOk = await anonPage.locator('img[alt="פיקסל בדיקה"]').evaluate((img) => img.complete && img.naturalWidth > 0);
check("uploaded image loads on public page", imgOk);
if (SHOTS) await anonPage.screenshot({ path: `${SHOTS}/e2e-public.png`, fullPage: true });

// Edit the live page, no redeploy.
await page.getByLabel("טקסט", { exact: true }).last().fill("טקסט מעודכן אחרי עריכה");
await page.getByRole("button", { name: "שמירה" }).click();
await page.getByText("נשמר. הדף החי עודכן.").waitFor();
await anonPage.reload();
check("edit is visible on public page immediately", (await anonPage.getByText("טקסט מעודכן אחרי עריכה").count()) === 1);

// Paid listing can't go live without checkout URL.
await page.getByRole("radio", { name: "בתשלום" }).click();
await page.getByRole("button", { name: "שמירה" }).click();
await page.locator("p[role=alert]").waitFor();
check("published paid resource without checkout is refused", (await page.locator("p[role=alert]").textContent()).includes("קישור לעמוד תשלום"));
await page.getByRole("radio", { name: "חינם" }).click();
await page.getByRole("button", { name: "שמירה" }).click();
await page.getByText("נשמר. הדף החי עודכן.").waitFor();

// Unpublish.
await page.getByRole("button", { name: "הסתר מהאתר" }).click();
await page.getByText("הדף הוסתר מהאתר.").waitFor();
res = await anonPage.goto(`${BASE}/resources/${slug}`);
check("unpublished page is gone", res.status() === 404);

// Clean up the test resource.
await page.getByRole("button", { name: "מחק", exact: true }).click();
await page.waitForURL(`${BASE}/admin`);
check("delete works", true);

// Site settings edit the homepage without a deploy.
await page.goto(`${BASE}/admin/settings`);
const hero = page.getByLabel("כותרת ראשית");
const oldHero = await hero.inputValue();
await hero.fill("כותרת בדיקה");
await page.getByLabel("קישור לפורטפוליו").fill("javascript:alert(1)");
await page.getByRole("button", { name: "שמירה" }).click();
await page.locator("[role=alert]", { hasText: "קישור" }).waitFor();
check("unsafe portfolio URL is rejected", true);
await page.getByLabel("קישור לפורטפוליו").fill("");
await page.getByRole("button", { name: "שמירה" }).click();
await page.getByText("נשמר. האתר מעודכן.").waitFor();
await anonPage.goto(`${BASE}/`);
check("homepage text comes from settings", (await anonPage.getByRole("heading", { name: "כותרת בדיקה" }).count()) === 1);
await hero.fill(oldHero);
await page.getByRole("button", { name: "שמירה" }).click();
await page.getByText("נשמר. האתר מעודכן.").waitFor();

check("no client-side errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
