import { getClient } from "@/lib/graphql-client";
import { GET_PUBLISHED_CHAPTER_IDS } from "@/graphql/queries/get-published-chapter-ids";
import { GET_USER_PROGRESS_COUNT } from "@/graphql/queries/get-user-progress-count";
import {
  GetPublishedChaptersResponse,
  GetUserProgressCountResponse,
} from "@/types";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const client = getClient();

    const { courseById } = await client.request<GetPublishedChaptersResponse>(
      GET_PUBLISHED_CHAPTER_IDS,
      {
        courseId,
      }
    );

    const publishedChapterIds = courseById.chapters
      .filter((chapter: any) => chapter.isPublished)
      .map((chapter: any) => chapter.id);

    if (publishedChapterIds.length === 0) return 0;

    const { userProgressCount } =
      await client.request<GetUserProgressCountResponse>(
        GET_USER_PROGRESS_COUNT,
        {
          userId,
          chapterIds: publishedChapterIds,
        }
      );

    const progressPercentage =
      (userProgressCount / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.error("[GET_PROGRESS_GRAPHQL]", error);
    return 0;
  }
};
