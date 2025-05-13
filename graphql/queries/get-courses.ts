import { gql } from "graphql-request";

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      title
      description
      imageUrl
      isPublished
      price
      category {
        id
        name
      }
      chapters {
        id
        isPublished
      }
      purchases {
        wallet
      }
    }
  }
`;
