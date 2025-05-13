import { gql } from "graphql-request";

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $wallet: String!
    $name: String
    $email: String
    $role: String
    $lensHandle: String
    $lensProfileId: String
  ) {
    registerUser(
      wallet: $wallet
      name: $name
      email: $email
      role: $role
      lensHandle: $lensHandle
      lensProfileId: $lensProfileId
    ) {
      wallet
      name
      role
    }
  }
`;
