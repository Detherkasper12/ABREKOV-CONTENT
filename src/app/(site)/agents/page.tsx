import { WaitlistPage, waitlistMetadata } from "@/components/WaitlistPage";
import { WAITLISTS } from "@/lib/waitlist";

export const dynamic = "force-dynamic";
export const metadata = waitlistMetadata(WAITLISTS["agents-course"]);

export default function AgentsWaitlistPage() {
  return <WaitlistPage w={WAITLISTS["agents-course"]} />;
}
