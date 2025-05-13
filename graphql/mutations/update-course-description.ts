import { gql } from "graphql-request";

export const UPDATE_COURSE_DESCRIPTION = gql`
  mutation UpdateCourseDescription(
    $wallet: String!
    $courseId: String!
    $description: String!
  ) {
    updateCourse(
      wallet: $wallet
      courseId: $courseId
      data: { description: $description }
    ) {
      id
      description
    }
  }
`;
