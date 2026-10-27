import { getSettings } from "@/lib/data";
import { emailConfigured } from "@/lib/email";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsForm initial={settings} emailReady={emailConfigured()} />;
}
