import { gql } from "graphql-request";
import { getClient } from "@/lib/graphql-client";

export const UPDATE_PROGRESS = gql`
  mutation UpdateProgress($chapterId: String!, $isCompleted: Boolean!) {
    updateProgress(chapterId: $chapterId, isCompleted: $isCompleted) {
      id
      isCompleted
    }
  }
`;

export const updateProgress = async ({
  chapterId,
  isCompleted,
}: {
  chapterId: string;
  isCompleted: boolean;
}) => {
  const client = getClient();
  return client.request(UPDATE_PROGRESS, { chapterId, isCompleted });
};
