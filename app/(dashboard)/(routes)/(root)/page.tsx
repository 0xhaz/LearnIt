import { getDashboardCourses } from "@/graphql/queries/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";
import { CheckCircle, Clock } from "lucide-react";

export default async function Dashboard() {
  const wallet = (await getWalletAddress())?.toLowerCase();

  if (!wallet) return redirect("/");

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    wallet
  );

  const allCourses = [...completedCourses, ...coursesInProgress];

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="Courses in Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed Courses"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>
      <CoursesList items={allCourses} />
    </div>
  );
}
