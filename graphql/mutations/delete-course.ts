import { gql } from "graphql-request";

export const DELETE_COURSE = gql`
  mutation DeleteCourse($wallet: String!, $courseId: String!) {
    deleteCourse(wallet: $wallet, courseId: $courseId) {
      id
    }
  }
`;
