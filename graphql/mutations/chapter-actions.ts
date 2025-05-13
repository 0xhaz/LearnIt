import { gql } from "graphql-request";

export const PUBLISH_CHAPTER = gql`
  mutation PublishChapter($chapterId: String!) {
    publishChapter(chapterId: $chapterId) {
      id
      isPublished
    }
  }
`;

export const UNPUBLISH_CHAPTER = gql`
  mutation UnpublishChapter($chapterId: String!) {
    unpublishChapter(chapterId: $chapterId) {
      id
      isPublished
    }
  }
`;

export const DELETE_CHAPTER = gql`
  mutation DeleteChapter($chapterId: String!) {
    deleteChapter(chapterId: $chapterId) {
      id
    }
  }
`;
