import { gql, useQuery } from "@apollo/client";
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

export const useChapter = (
  userId: string,
  courseId: string,
  chapterId: string
) =>
  useQuery<GetChapterResponse>(GET_CHAPTER, {
    variables: { userId, courseId, chapterId },
    skip: !userId || !courseId || !chapterId,
    fetchPolicy: "network-only", // ensures fresh data after enrollment
  });
