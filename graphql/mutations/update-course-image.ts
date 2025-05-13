import { gql } from "graphql-request";

export const UPDATE_COURSE_IMAGE = gql`
  mutation UpdateCourseImage(
    $wallet: String!
    $courseId: String!
    $imageUrl: String!
  ) {
    updateCourse(
      wallet: $wallet
      courseId: $courseId
      data: { imageUrl: $imageUrl }
    ) {
      id
      imageUrl
    }
  }
`;
