import { gql } from "graphql-request";

export const GET_COURSE_WITH_ID = gql`
  query GetCourse($id: ID!) {
    courseById(id: $id) {
      id
      title
      description
      imageUrl
      price
      isPublished
      wallet
      categoryId
      createdAt
      updatedAt

      attachments {
        id
        url
        name
      }

      chapters {
        id
        title
        isFree
        isPublished
        position
        createdAt
        updatedAt
        muxData {
          playbackId
        }
      }

      enrollments {
        id
        wallet
        txHash
        enrolledVia
        createdAt
      }
    }
  }
`;
