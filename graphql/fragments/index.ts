import { FragmentOf } from "@lens-protocol/react";

import { AccountFragment, AccountMetadataFragment } from "./account";
import { PostMetadataFragment } from "./posts";

declare module "@lens-protocol/react" {
  export interface Account extends FragmentOf<typeof AccountFragment> {}
  export interface accountMetadata
    extends FragmentOf<typeof AccountMetadataFragment> {}

  export type PostMetadata = FragmentOf<typeof PostMetadataFragment>;
}

export const fragments = [AccountFragment, PostMetadataFragment];
