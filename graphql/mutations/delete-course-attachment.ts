import { gql } from "graphql-request";

export const DELETE_COURSE_ATTACHMENT = gql`
  mutation DeleteAttachment($courseId: String!, $attachmentId: String!) {
    deleteAttachment(courseId: $courseId, attachmentId: $attachmentId) {
      id
    }
  }
`;
