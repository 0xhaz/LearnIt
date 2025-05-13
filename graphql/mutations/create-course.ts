import { gql } from "graphql-request";

export const CREATE_COURSE = gql`
  mutation CreateCourse($wallet: String!, $title: String!) {
    createCourse(wallet: $wallet, title: $title) {
      id
      title
    }
  }
`;
