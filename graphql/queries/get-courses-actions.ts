import { getProgress } from "@/graphql/queries/get-progress";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSES } from "@/graphql/queries/get-courses";

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

type CourseGraphQL = {
  id: string;
  title: string;
  isPublished: boolean;
  category?: {
    id: string;
  } | null;
  purchases: { userId: string }[];
};

export const getCourses = async ({ userId, title, categoryId }: GetCourses) => {
  try {
    const client = getClient();
    const { courses } = await client.request<any>(GET_COURSES, {
      userId,
      title,
      categoryId,
    });

    const filtered = courses.filter((course: CourseGraphQL) => {
      if (!course.isPublished) return false;
      if (title && !course.title.toLowerCase().includes(title.toLowerCase()))
        return false;
      if (categoryId && course.category?.id !== categoryId) return false;
      return true;
    });

    const coursesWithProgress = await Promise.all(
      filtered.map(async (course: any) => {
        const hasPurchase = course.purchases.length > 0;

        return {
          ...course,
          progress: hasPurchase ? await getProgress(userId, course.id) : null,
        };
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSES_GRAPHQL]", error);
    return [];
  }
};
