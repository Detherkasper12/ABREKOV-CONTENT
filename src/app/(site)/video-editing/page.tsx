import { WaitlistPage, waitlistMetadata } from "@/components/WaitlistPage";
import { WAITLISTS } from "@/lib/waitlist";

// Static, rebuilt on every admin save (and at most hourly as a fallback).
export const revalidate = 3600;
export const metadata = waitlistMetadata(WAITLISTS["video-course"]);

export default function VideoEditingWaitlistPage() {
  return <WaitlistPage w={WAITLISTS["video-course"]} />;
}
