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

export interface GetCourseWithIdResponse {
  courseById: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    isPublished: boolean;
    wallet: string;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
    attachments: {
      id: string;
      url: string;
      name: string;
    }[];
    chapters: {
      id: string;
      title: string;
      isFree: boolean;
      isPublished: boolean;
      position: number;
      createdAt: string;
      updatedAt: string;
      muxData?: {
        playbackId?: string;
      } | null;
    }[];
  };
}

export type GetCategoriesResponse = {
  categories: {
    id: string;
    name: string;
  }[];
};

export type GetChapterByIdResponse = {
  chapterById: {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    isPublished: boolean;
    isFree: boolean;
    position: number;
    createdAt?: string;
    updatedAt?: string;
    muxData?: {
      id: string;
      assetId: string;
      playbackId?: string;
      chapterId: string;
    } | null;
  };
};

export type CourseListItem = {
  id: string;
  title: string;
  price: number | null;
  isPublished: boolean;
  updatedAt: string;
};

export interface GetCoursesByWalletResponse {
  coursesByWallet: CourseListItem[];
}

export interface PublishedChapter {
  id: string;
  isPublished: boolean;
}

export interface GetPublishedChaptersResponse {
  courseById: {
    chapters: PublishedChapter[];
  };
}

export interface GetUserProgressCountResponse {
  userProgressCount: number;
}

export type CourseWithProgressAndCategory = {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  category: {
    name: string;
  } | null;
  chapters: {
    id: string;
  }[];
  progress: number | null;
};

export interface GetCourseSidebarDataResponse {
  course: {
    id: string;
    title: string;
    chapters: {
      id: string;
      title: string;
      isFree: boolean;
      userProgress: {
        isCompleted: boolean;
      }[];
    }[];
    purchases: {
      id: string;
    }[];
  };
}

export type CourseSidebarChapter = {
  id: string;
  title: string;
  isFree: boolean;
  userProgress: {
    isCompleted: boolean;
  }[];
};

export interface GetCourseFirstPublishedChapterResponse {
  course: {
    id: string;
    chapters: {
      id: string;
      position: number;
      isPublished: boolean;
    }[];
  };
}
