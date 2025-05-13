import { redirect } from "next/navigation";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSE_FIRST_PUBLISHED_CHAPTER } from "@/graphql/queries/get-course-first-published-chapter";
import { GetCourseFirstPublishedChapterResponse } from "@/types";

const CoursePage = async ({ params }: { params: { courseId: string } }) => {
  const client = getClient();

  const { course } =
    await client.request<GetCourseFirstPublishedChapterResponse>(
      GET_COURSE_FIRST_PUBLISHED_CHAPTER,
      {
        id: params.courseId,
      }
    );

  if (!course || !course.chapters) return redirect("/");

  const firstPublishedChapter = course.chapters
    .filter(ch => ch.isPublished)
    .sort((a, b) => a.position - b.position)[0];

  if (!firstPublishedChapter) return redirect("/");

  return redirect(`/courses/${course.id}/chapters/${firstPublishedChapter.id}`);
};

export default CoursePage;
