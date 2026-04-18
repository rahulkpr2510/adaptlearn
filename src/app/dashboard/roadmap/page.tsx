import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardRoadmapPage() {
  redirect("/roadmap?track=dsa");
}
