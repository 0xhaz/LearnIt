import { gql } from "graphql-request";

export const GET_PURCHASED_COURSES = gql`
  query GetPurchasedCourses($wallet: String!) {
    purchases(where: { wallet: $wallet }) {
      course {
        id
        title
        description
        imageUrl
        price
        isPublished
        createdAt
        updatedAt
        category {
          id
          name
        }
        chapters {
          id
          isPublished
        }
      }
    }
  }
`;
