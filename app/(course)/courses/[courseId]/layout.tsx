import { redirect } from "next/navigation";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSE_WITH_PROGRESS } from "@/graphql/queries/get-course-with-progress";
import { getProgress } from "@/graphql/queries/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";
import { CourseWithProgressResponse } from "@/types";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const wallet = (await getWalletAddress())?.toLowerCase();
  if (!wallet) return redirect("/");

  const client = getClient();
  const { course } = await client.request<CourseWithProgressResponse>(
    GET_COURSE_WITH_PROGRESS,
    {
      courseId: params.courseId,
      wallet,
    }
  );

  if (!course) return redirect("/");

  const progressCount = await getProgress(wallet, course.id);
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:!flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar courseId={course.id} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
