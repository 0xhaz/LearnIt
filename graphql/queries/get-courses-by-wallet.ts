import { gql } from "graphql-request";

export const GET_COURSES_BY_WALLET = gql`
  query GetCoursesByWallet($wallet: String!) {
    coursesByWallet(wallet: $wallet) {
      id
      title
      description
      imageUrl
      price
      isPublished
      categoryId
      createdAt
      updatedAt
    }
  }
`;
