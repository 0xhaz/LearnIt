import { gql } from "graphql-request";

export const UPDATE_COURSE_PRICE = gql`
  mutation UpdateCourse(
    $wallet: String!
    $courseId: String!
    $data: CourseInput!
  ) {
    updateCourse(wallet: $wallet, courseId: $courseId, data: $data) {
      id
      price
    }
  }
`;
