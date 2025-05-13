import { gql } from "graphql-request";

export const ADD_COURSE_ATTACHMENT = gql`
  mutation AddCourseAttachment($courseId: String!, $url: String!) {
    addCourseAttachment(courseId: $courseId, url: $url) {
      id
      name
      url
    }
  }
`;
