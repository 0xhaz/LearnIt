import { gql } from "graphql-request";

export const UPDATE_CHAPTER_VIDEO = gql`
  mutation UpdateChapterVideo($chapterId: String!, $data: ChapterInput!) {
    updateChapter(chapterId: $chapterId, data: $data) {
      id
      videoUrl
      isPublished
      muxData {
        playbackId
      }
    }
  }
`;
