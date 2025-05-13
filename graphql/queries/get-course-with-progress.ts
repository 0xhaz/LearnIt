import { gql } from "graphql-request";

export const GET_COURSE_WITH_PROGRESS = gql`
  query GetCourseWithProgress($courseId: ID!, $wallet: String!) {
    course(id: $courseId) {
      id
      title
      chapters {
        id
        title
        position
        isPublished
        userProgress(wallet: $wallet) {
          isCompleted
        }
      }
    }
  }
`;
