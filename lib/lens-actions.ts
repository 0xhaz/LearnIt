import { client } from "@/lens/client";
import { uploadJsonToIPFS } from "@/lib/ipfs";
import { request } from "graphql-request";
import { CREATE_LENS_PUBLICATION } from "@/graphql/mutations/create-lens-publication";
import { fetchAccount } from "@lens-protocol/client/actions";
import { Course } from "@/types";

export async function postCourseToLens(course: Course) {
  const profile = await fetchAccount(client, {
    address: course.wallet,
  });
}
