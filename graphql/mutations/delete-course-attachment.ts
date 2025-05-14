import { gql } from "graphql-request";

export const DELETE_COURSE_ATTACHMENT = gql`
  mutation DeleteCourseAttachment($courseId: String!, $attachmentId: String!) {
    deleteCourseAttachment(courseId: $courseId, attachmentId: $attachmentId) {
      id
    }
  }
`;
