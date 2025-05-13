import { gql } from "graphql-request";

export const UPDATE_CHAPTER_DESCRIPTION = gql`
  mutation UpdateChapterDescription(
    $chapterId: String!
    $description: String!
  ) {
    updateChapter(chapterId: $chapterId, data: { description: $description }) {
      id
      description
    }
  }
`;
