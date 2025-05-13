import { gql } from "graphql-request";

export const GET_PUBLISHED_CHAPTER_IDS = gql`
  query GetPublishedChapterIds($courseId: ID!) {
    courseById(id: $courseId) {
      chapters {
        id
        isPublished
      }
    }
  }
`;
