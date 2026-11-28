import { WaitlistPage, waitlistMetadata } from "@/components/WaitlistPage";
import { WAITLISTS } from "@/lib/waitlist";

// Rendered per request from cached data (see lib/data.ts), so no page waits on the database.
export const dynamic = "force-dynamic";
export const metadata = waitlistMetadata(WAITLISTS["agents-course"]);

export default function AgentsWaitlistPage() {
  return <WaitlistPage w={WAITLISTS["agents-course"]} />;
}
