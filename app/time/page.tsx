import type { Metadata } from "next";
import TimeDashboard from "../components/TimeDashboard";

export const metadata: Metadata = {
  title: "TIME DESK | timezone dashboard",
  description: "A live timezone, countdown, and delayed action dashboard.",
};

export default function TimePage() {
  return <TimeDashboard />;
}
