import { gql } from "graphql-request";

export const GET_USER_PROGRESS_COUNT = gql`
  query GetUserProgressCount($userId: String!, $chapterIds: [String!]!) {
    userProgressCount(userId: $userId, chapterIds: $chapterIds)
  }
`;
