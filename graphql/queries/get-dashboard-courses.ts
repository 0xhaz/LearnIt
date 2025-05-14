import { getClient } from "@/lib/graphql-client";
import { GET_PURCHASED_COURSES } from "@/graphql/queries/get-purchased-courses";
import { getProgress } from "./get-progress";
import { GetPurchasedCoursesResponse } from "@/types";

export type CourseWithProgressWithCategory = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  chapters: {
    id: string;
    isPublished: boolean;
  }[];
  progress: number | null;
};

export type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    const client = getClient();
    const { purchases } = await client.request<GetPurchasedCoursesResponse>(
      GET_PURCHASED_COURSES,
      { wallet: userId }
    );

    const courses = purchases.map(
      p => p.course
    ) as CourseWithProgressWithCategory[];

    for (const course of courses) {
      const progress = await getProgress(userId, course.id);
      course.progress = progress;
    }

    const completedCourses = courses.filter(course => course.progress === 100);
    const coursesInProgress = courses.filter(
      course => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_COURSES_GRAPHQL]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
