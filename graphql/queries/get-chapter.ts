import { gql } from "graphql-request";
import { getClient } from "@/lib/graphql-client";
import { GetChapterResponse } from "@/types";

export const GET_CHAPTER = gql`
  query GetChapter($userId: String!, $courseId: String!, $chapterId: String!) {
    getChapter(userId: $userId, courseId: $courseId, chapterId: $chapterId) {
      chapter {
        id
        title
        description
        position
        isPublished
        isFree
      }
      course {
        price
      }
      muxData {
        playbackId
      }
      attachments {
        id
        name
        url
      }
      nextChapter {
        id
        title
      }
      userProgress {
        isCompleted
      }
      purchase {
        id
      }
    }
  }
`;

export const getChapterQuery = async ({
  userId,
  courseId,
  chapterId,
}: {
  userId: string;
  courseId: string;
  chapterId: string;
}) => {
  const client = getClient();

  const { getChapter } = await client.request<GetChapterResponse>(GET_CHAPTER, {
    userId,
    courseId,
    chapterId,
  });

  return getChapter;
};
