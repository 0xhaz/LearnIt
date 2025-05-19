import type { FragmentOf } from "@lens-protocol/client";

import { AccountFragment, AccountMetadataFragment } from "./accounts";
import { PostMetadataFragment } from "./posts";
import { MediaImageFragment } from "./images";

declare module "@lens-protocol/client" {
  export interface LocalAccount extends FragmentOf<typeof AccountFragment> {}
  export interface LocalAccountMetadata
    extends FragmentOf<typeof AccountMetadataFragment> {}
  export interface LocalMediaImage
    extends FragmentOf<typeof MediaImageFragment> {}
  export type LocalPostMetadata = FragmentOf<typeof PostMetadataFragment>;
}

export const fragments = [
  AccountFragment,
  PostMetadataFragment,
  MediaImageFragment,
];
