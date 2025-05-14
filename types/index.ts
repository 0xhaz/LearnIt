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

export interface GetChapterResponse {
  getChapter: {
    chapter: {
      id: string;
      title: string;
      description?: string;
      position: number;
      isFree: boolean;
      isPublished: boolean;
    };
    course: {
      price: number;
    };
    muxData: {
      playbackId: string;
    } | null;
    attachments: {
      id: string;
      name: string;
      url: string;
    }[];
    nextChapter: {
      id: string;
      title: string;
    } | null;
    userProgress: {
      isCompleted: boolean;
    } | null;
    purchase: {
      id: string;
    } | null;
  };
}

export interface CourseWithProgressResponse {
  course: {
    id: string;
    title: string;
    chapters: {
      id: string;
      title: string;
      isFree: boolean;
      isPublished: boolean;
      position: number;
      userProgress: {
        isCompleted: boolean;
      }[];
    }[];
  };
}

export interface GetPurchasedCoursesResponse {
  purchases: {
    course: {
      id: string;
      title: string;
      description: string | null;
      imageUrl: string | null;
      price: number | null;
      isPublished: boolean;
      createdAt: string;
      updatedAt: string;
      category: {
        id: string;
        name: string;
      };
      chapters: {
        id: string;
        isPublished: boolean;
      }[];
    };
  }[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  wallet: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isPublished?: boolean;
  categoryId?: string;
  category?: Category;
  attachments: Attachment[];
  chapters: Chapter[];
  enrollments: Enrollment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  courses?: Course[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  muxData?: MuxData;
  courseId: string;
  course?: Course;
  userProgress?: UserProgress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  wallet: string;
  courseId: string;
  enrolledVia?: string;
  txHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MuxData {
  id: string;
  assetId: string;
  playbackId?: string;
  chapterId: string;
}

export interface UserProgress {
  id: string;
  wallet: string;
  chapterId: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
