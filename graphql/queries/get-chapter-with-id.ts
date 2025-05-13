import { gql } from "graphql-request";

export const GET_CHAPTER_WITH_ID = gql`
  query GetChapterById($id: ID!) {
    chapterById(id: $id) {
      id
      title
      description
      videoUrl
      isPublished
      isFree
      courseId
      position
      createdAt
      updatedAt
      muxData {
        id
        assetId
        playbackId
        chapterId
      }
    }
  }
`;
