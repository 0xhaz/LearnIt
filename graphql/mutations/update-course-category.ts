import { gql } from "graphql-request";

export const UPDATE_COURSE_CATEGORY = gql`
  mutation updateCourse(
    $wallet: String!
    $courseId: String!
    $data: CourseInput!
  ) {
    updateCourse(wallet: $wallet, courseId: $courseId, data: $data) {
      id
      title
      categoryId
    }
  }
`;
