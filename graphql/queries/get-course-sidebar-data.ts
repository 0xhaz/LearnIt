import { gql } from "graphql-request";

export const GET_COURSE_SIDEBAR_DATA = gql`
  query GetCourseSidebarData($wallet: String!, $courseId: String!) {
    course(id: $courseId) {
      id
      title
      chapters(orderBy: { position: asc }) {
        id
        title
        isFree
        userProgress(wallet: $wallet) {
          isCompleted
        }
      }
      purchases(where: { wallet: $wallet }) {
        id
      }
    }
  }
`;
