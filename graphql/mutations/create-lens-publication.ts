import { gql } from "graphql-request";

export const CREATE_LENS_PUBLICATION = gql`
  mutation CreateLensPublication(
    $publicationId: String!
    $type: LensPublicationType!
    $courseId: String
    $createdBy: String!
  ) {
    CreateLensPublication(
      publicationId: $publicationId
      type: $type
      courseId: $courseId
      createdBy: $createdBy
    ) {
      id
    }
  }
`;
