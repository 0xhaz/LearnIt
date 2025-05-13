import { gql } from "graphql-request";

export const REORDER_COURSE_CHAPTERS = gql`
  mutation ReorderChapters(
    $wallet: String!
    $courseId: String!
    $list: [ReorderInput!]!
  ) {
    reorderChapters(wallet: $wallet, courseId: $courseId, list: $list) {
      id
      position
    }
  }
`;
