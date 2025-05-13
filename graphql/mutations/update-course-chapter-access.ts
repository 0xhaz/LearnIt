import { gql } from "graphql-request";

export const UPDATE_CHAPTER_ACCESS = gql`
  mutation UpdateChapterAccess($chapterId: String!, $data: ChapterInput!) {
    updateChapter(chapterId: $chapterId, data: $data) {
      id
      isFree
    }
  }
`;
