import { gql } from "graphql-request";

export const PUBLISH_COURSE = gql`
  mutation PublishCourse(
    $wallet: String!
    $courseId: String!
    $isPublished: Boolean
  ) {
    updateCourse(
      wallet: $wallet
      courseId: $courseId
      data: { isPublished: $isPublished }
    ) {
      id
      isPublished
    }
  }
`;
