import { gql } from "graphql-request";

export const UPDATE_USER_PROGRESS = gql`
  mutation UpdateUserProgress($chapterId: String!, $isCompleted: Boolean!) {
    updateUserProgress(chapterId: $chapterId, isCompleted: $isCompleted) {
      id
      isCompleted
    }
  }
`;
