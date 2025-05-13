import { gql } from "graphql-request";

export const UPDATE_COURSE_TITLE = gql`
  mutation UpdateCourseTitle(
    $wallet: String!
    $courseId: String!
    $title: String!
  ) {
    updateCourse(
      wallet: $wallet
      courseId: $courseId
      data: { title: $title }
    ) {
      id
      title
    }
  }
`;
