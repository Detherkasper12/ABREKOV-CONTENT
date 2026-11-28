import { WaitlistPage, waitlistMetadata } from "@/components/WaitlistPage";
import { WAITLISTS } from "@/lib/waitlist";

export const dynamic = "force-dynamic";
export const metadata = waitlistMetadata(WAITLISTS["video-course"]);

export default function VideoEditingWaitlistPage() {
  return <WaitlistPage w={WAITLISTS["video-course"]} />;
}
