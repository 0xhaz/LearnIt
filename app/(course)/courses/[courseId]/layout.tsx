import { redirect } from "next/navigation";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSE_WITH_PROGRESS } from "@/graphql/queries/get-course-with-progress";
import { getProgress } from "@/actions/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

interface GetCourseWithProgressResponse {
  course: {
    id: string;
    title: string;
    chapters: {
      id: string;
      title: string;
      position: number;
      isPublished: boolean;
      userProgress: {
        isCompleted: boolean;
      }[];
    }[];
  };
}

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const wallet = await getWalletAddress();
  if (!wallet) return redirect("/");

  const client = getClient();

  const { course } = await client.request<GetCourseWithProgressResponse>(
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
        {/* <CourseNavbar course={course} progressCount={progressCount} /> */}
      </div>
      <div className="hidden md:!flex h-full w-80 flex-col fixed inset-y-0 z-50">
        {/* <CourseSidebar course={course} progressCount={progressCount} /> */}
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
