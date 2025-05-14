import { getWalletAddress } from "@/lib/get-wallet-server";
import { redirect } from "next/navigation";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSE_SIDEBAR_DATA } from "@/graphql/queries/get-course-sidebar-data";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";
import { GetCourseSidebarDataResponse, CourseSidebarChapter } from "@/types";

interface CourseSidebarProps {
  courseId: string;
  progressCount: number;
}

export const CourseSidebar = async ({
  courseId,
  progressCount,
}: CourseSidebarProps) => {
  const wallet = await getWalletAddress();
  if (!wallet) return redirect("/");

  const client = getClient();
  const { course } = await client.request<GetCourseSidebarDataResponse>(
    GET_COURSE_SIDEBAR_DATA,
    {
      wallet,
      courseId,
    }
  );

  const hasPurchase = course.purchases.length > 0;

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        {hasPurchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter: CourseSidebarChapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            courseId={course.id}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            isLocked={!chapter.isFree && !hasPurchase}
          />
        ))}
      </div>
    </div>
  );
};
