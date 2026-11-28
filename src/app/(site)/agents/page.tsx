import { WaitlistPage, waitlistMetadata } from "@/components/WaitlistPage";
import { WAITLISTS } from "@/lib/waitlist";

// Static, rebuilt on every admin save (and at most hourly as a fallback).
export const revalidate = 3600;
export const metadata = waitlistMetadata(WAITLISTS["agents-course"]);

export default function AgentsWaitlistPage() {
  return <WaitlistPage w={WAITLISTS["agents-course"]} />;
}
