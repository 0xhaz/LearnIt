export interface Chapter {
  id: string;
  title: string;
  isPublished: boolean;
  isFree: boolean;
  description?: string;
  videoUrl?: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MuxData {
  id: string;
  assetId: string;
  playbackId?: string;
  chapterId: string;
}
