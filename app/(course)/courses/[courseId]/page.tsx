import { redirect } from "next/navigation";
import { GET_COURSE_FIRST_PUBLISHED_CHAPTER } from "@/graphql/queries/get-course-first-published-chapter";
import { getClient } from "@/lib/graphql-client";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { GetCourseFirstPublishedChapterResponse } from "@/types";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const wallet = (await getWalletAddress())?.toLowerCase();
  if (!wallet) return redirect("/");

  const client = getClient();

  const { course } =
    await client.request<GetCourseFirstPublishedChapterResponse>(
      GET_COURSE_FIRST_PUBLISHED_CHAPTER,
      {
        id: params.courseId,
      }
    );

  if (!course) return redirect("/");

  const firstPublishedChapter = course.chapters.find(
    (
      chapter
    ): chapter is { id: string; isPublished: boolean; position: number } =>
      chapter.isPublished
  );

  if (!firstPublishedChapter) return redirect("/");
  return redirect(
    `/courses/${params.courseId}/chapters/${firstPublishedChapter?.id}`
  );
};

export default CourseIdPage;
