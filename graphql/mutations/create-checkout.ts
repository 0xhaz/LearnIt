import { gql } from "graphql-request";

export const CREATE_CHECKOUT = gql`
  mutation CreateCheckout($courseId: String!) {
    createCheckout(courseId: $courseId) {
      url
    }
  }
`;
