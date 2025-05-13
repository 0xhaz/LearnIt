import { gql } from "graphql-request";

export const UPDATE_CHAPTER = gql`
  mutation UpdateChapter($chapterId: String!, $data: ChapterInput!) {
    updateChapter(chapterId: $chapterId, data: $data) {
      id
      title
    }
  }
`;
