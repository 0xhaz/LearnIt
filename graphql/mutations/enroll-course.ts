import { gql } from "graphql-request";

export const ENROLL_COURSE = gql`
  mutation EnrollInCourse(
    $wallet: String!
    $courseId: String!
    $enrolledVia: String!
    $txHash: String!
  ) {
    enrollInCourse(
      wallet: $wallet
      courseId: $courseId
      enrolledVia: $enrolledVia
      txHash: $txHash
    ) {
      id
      wallet
      courseId
      enrolledVia
      txHash
      createdAt
    }
  }
`;

export const CHECK_ENROLLMENT = gql`
  query CheckEnrollment($wallet: String!, $courseId: String!) {
    checkEnrollment(wallet: $wallet, courseId: $courseId) {
      id
      wallet
      courseId
      enrolledVia
      txHash
      createdAt
    }
  }
`;
