import { gql } from "graphql-request";

export const CREATE_COURSE_CHAPTER = gql`
  mutation CreateChapter(
    $wallet: String!
    $courseId: String!
    $title: String!
  ) {
    createChapter(wallet: $wallet, courseId: $courseId, title: $title) {
      id
      title
      position
    }
  }
`;
