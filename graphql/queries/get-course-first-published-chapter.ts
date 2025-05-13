import { gql } from "graphql-request";

export const GET_COURSE_FIRST_PUBLISHED_CHAPTER = gql`
  query GetCourseFirstPublishedChapter($id: ID!) {
    course(id: $id) {
      id
      chapters {
        id
        position
        isPublished
      }
    }
  }
`;
