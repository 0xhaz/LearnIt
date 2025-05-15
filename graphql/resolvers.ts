import { Context } from "./context";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

interface ChapterInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  isFree?: boolean;
  isPublished?: boolean;
}

export const resolvers = {
  Query: {
    courses: async (
      _parent: any,
      args: { title?: string; categoryId?: string; isPublished?: boolean },
      ctx: Context
    ) => {
      return ctx.prisma.course.findMany({
        where: {
          ...(args.title && {
            title: {
              contains: args.title,
              mode: "insensitive",
            },
          }),
          ...(args.categoryId && { categoryId: args.categoryId }),
          ...(args.isPublished !== undefined && {
            isPublished: args.isPublished,
          }),
        },
        include: {
          category: true,
          chapters: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },

    course: async (_parent: any, _args: { id: string }, ctx: Context) => {
      return ctx.prisma.course.findUnique({
        where: { id: _args.id },
        include: { chapters: true },
      });
    },

    courseById: async (_: any, args: { id: string }, ctx: Context) => {
      return ctx.prisma.course.findUnique({
        where: { id: args.id },
        include: {
          attachments: true,
          chapters: {
            orderBy: { position: "asc" },
          },
        },
      });
    },

    categories: async (_: any, _args: any, ctx: Context) => {
      try {
        const categories = await ctx.prisma.category.findMany({
          orderBy: { name: "asc" },
        });

        return categories ?? [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },

    getChapter: async (
      _: any,
      args: { userId: string; courseId: string; chapterId: string },
      ctx: Context
    ) => {
      const { userId, courseId, chapterId } = args;

      const [purchase, course, chapter] = await Promise.all([
        ctx.prisma.purchase.findUnique({
          where: {
            wallet_courseId: {
              wallet: userId,
              courseId,
            },
          },
        }),
        ctx.prisma.course.findUnique({
          where: { id: courseId },
          select: { price: true },
        }),
        ctx.prisma.chapter.findUnique({
          where: { id: chapterId, isPublished: true },
        }),
      ]);

      if (!chapter || !course) throw new Error("Chapter or Course not found");

      const [muxData, attachments, nextChapter, userProgress] =
        await Promise.all([
          chapter.isFree || purchase
            ? ctx.prisma.muxData.findUnique({ where: { chapterId } })
            : null,
          purchase
            ? ctx.prisma.attachment.findMany({ where: { courseId } })
            : [],
          chapter.isFree || purchase
            ? ctx.prisma.chapter.findFirst({
                where: {
                  courseId,
                  isPublished: true,
                  position: { gt: chapter.position },
                },
                orderBy: { position: "asc" },
              })
            : null,
          ctx.prisma.userProgress.findUnique({
            where: {
              wallet_chapterId: {
                wallet: userId,
                chapterId,
              },
            },
          }),
        ]);

      return {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
      };
    },

    chapterById: async (_: any, args: { id: string }, ctx: Context) => {
      return ctx.prisma.chapter.findUnique({
        where: { id: args.id },
        include: { muxData: true },
      });
    },

    coursesByWallet: async (_: any, args: { wallet: string }, ctx: Context) => {
      return ctx.prisma.course.findMany({
        where: { wallet: args.wallet.toLowerCase() },
        orderBy: { createdAt: "desc" },
      });
    },

    userProgressCount: async (
      _: any,
      args: { userId: string; chapterIds: string[] },
      ctx: Context
    ) => {
      return ctx.prisma.userProgress.count({
        where: {
          wallet: args.userId,
          chapterId: { in: args.chapterIds },
          isCompleted: true,
        },
      });
    },

    purchases: async (
      _: any,
      args: { where?: { wallet?: string } },
      ctx: Context
    ) => {
      return ctx.prisma.purchase.findMany({
        where: {
          ...(args.where?.wallet && { wallet: args.where.wallet }),
        },
        include: {
          course: {
            include: {
              category: true,
              chapters: {
                where: { isPublished: true },
              },
            },
          },
        },
      });
    },

    checkEnrollment: async (
      _: any,
      args: { wallet: string; courseId: string },
      ctx: Context
    ) => {
      const { wallet, courseId } = args;
      return ctx.prisma.enrollment.findUnique({
        where: {
          wallet_courseId: {
            wallet: wallet.toLowerCase(),
            courseId,
          },
        },
      });
    },
  },

  Course: {
    chapters: async (
      parent: any,
      args: { orderBy?: { position?: "asc" | "desc" } },
      ctx: Context
    ) => {
      return ctx.prisma.chapter.findMany({
        where: { courseId: parent.id },
        orderBy: args.orderBy ?? { position: "asc" },
      });
    },

    purchases: async (
      parent: any,
      args: { where?: { wallet?: string } },
      ctx: Context
    ) => {
      return ctx.prisma.purchase.findMany({
        where: {
          courseId: parent.id,
          ...(args.where?.wallet && { wallet: args.where.wallet }),
        },
      });
    },
  },

  Chapter: {
    userProgress: async (
      parent: any,
      args: { wallet?: string },
      ctx: Context
    ) => {
      const where = {
        chapterId: parent.id,
        ...(args.wallet && { wallet: args.wallet }),
      };

      return ctx.prisma.userProgress.findMany({
        where,
      });
    },
  },

  Mutation: {
    seedCategories: async (_parent: any, _args: any, ctx: Context) => {
      const categories = [
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Fitness" },
        { name: "Photography" },
        { name: "Accounting" },
        { name: "Engineering" },
        { name: "Filming" },
      ];

      await ctx.prisma.category.createMany({
        data: categories,
      });

      return ctx.prisma.category.findMany({
        where: {
          name: { in: categories.map(c => c.name) },
        },
      });
    },

    registerUser: async (_: any, args: any, ctx: Context) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { wallet: args.wallet.toLowerCase() },
      });
      if (existing) return existing;

      return ctx.prisma.user.create({
        data: {
          wallet: args.wallet.toLowerCase(),
          name: args.name,
          email: args.email,
          role: args.role,
          lensHandle: args.lensHandle,
          lensProfileId: args.lensProfileId,
        },
      });
    },

    deleteUser: async (_: any, args: { wallet: string }, ctx: Context) => {
      const user = await ctx.prisma.user.findUnique({
        where: { wallet: args.wallet.toLowerCase() },
      });
      if (!user) return null;

      return ctx.prisma.user.delete({
        where: { wallet: args.wallet.toLowerCase() },
      });
    },

    createCourse: async (
      _: any,
      args: { wallet: string; title: string },
      ctx: Context
    ) => {
      const normalizedWallet = args.wallet.toLowerCase();

      const user = await ctx.prisma.user.findUnique({
        where: { wallet: normalizedWallet },
      });

      if (!user) {
        throw new Error("Unauthorized: Wallet not registered");
      }

      const course = await ctx.prisma.course.create({
        data: {
          wallet: normalizedWallet,
          title: args.title,
        },
      });
      return course;
    },

    updateCourse: async (
      _: any,
      args: { wallet: string; courseId: string; data: any },
      ctx: Context
    ) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          id: args.courseId,
        },
      });

      if (!course || course.wallet !== args.wallet.toLowerCase()) {
        throw new Error("Unauthorized or course not found");
      }

      return ctx.prisma.course.update({
        where: { id: args.courseId },
        data: args.data,
      });
    },

    deleteCourse: async (
      _: any,
      args: { wallet: string; courseId: string },
      ctx: Context
    ) => {
      const course = await ctx.prisma.course.findUnique({
        where: {
          id: args.courseId,
        },
        include: {
          chapters: {
            include: {
              muxData: true,
            },
          },
        },
      });
      if (!course || course.wallet !== args.wallet.toLowerCase()) {
        throw new Error("Unauthorized or course not found");
      }

      const mux = new (require("@mux/mux-node").Mux)({
        tokenId: process.env.MUX_TOKEN_ID!,
        tokenSecret: process.env.MUX_TOKEN_SECRET!,
      });

      for (const chapter of course.chapters) {
        if (chapter.muxData?.assetId) {
          await mux.video.assets.delete(chapter.muxData.assetId);
        }
      }

      return ctx.prisma.course.delete({
        where: { id: args.courseId },
      });
    },

    createChapter: async (
      _: any,
      args: { wallet: string; courseId: string; title: string },
      ctx: Context
    ) => {
      const wallet = args.wallet.toLowerCase();

      const course = await ctx.prisma.course.findUnique({
        where: { id: args.courseId },
      });

      if (!course || course.wallet !== wallet) {
        throw new Error("Unauthorized or course not found");
      }

      const chapterCount = await ctx.prisma.chapter.count({
        where: { courseId: args.courseId },
      });

      const newChapter = await ctx.prisma.chapter.create({
        data: {
          title: args.title,
          position: chapterCount + 1,
          courseId: args.courseId,
        },
      });

      return newChapter;
    },

    updateChapter: async (
      _: any,
      args: { chapterId: string; data: ChapterInput },
      ctx: Context
    ) => {
      const { chapterId, data } = args;

      const updatedChapter = await ctx.prisma.chapter.update({
        where: { id: chapterId },
        data,
      });

      if (data.videoUrl) {
        const existingMuxData = await ctx.prisma.muxData.findFirst({
          where: { chapterId },
        });

        if (existingMuxData) {
          await mux.video.assets.delete(existingMuxData.assetId);
          await ctx.prisma.muxData.delete({
            where: { id: existingMuxData.id },
          });
        }

        const asset = await mux.video.assets.create({
          inputs: [{ url: data.videoUrl }],
          playback_policy: ["public"],
          test: false,
        });

        await ctx.prisma.muxData.create({
          data: {
            chapterId,
            assetId: asset.id,
            playbackId: asset.playback_ids?.[0]?.id || null,
          },
        });
      }

      return ctx.prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { muxData: true },
      });
    },

    reorderChapters: async (
      _: any,
      args: {
        wallet: string;
        courseId: string;
        list: { id: string; position: number }[];
      },
      ctx: Context
    ) => {
      const wallet = args.wallet.toLowerCase();

      const course = await ctx.prisma.course.findUnique({
        where: { id: args.courseId },
      });

      if (!course || course.wallet !== wallet) {
        throw new Error("Unauthorized or course not found");
      }

      const updatePromises = args.list.map(chapter =>
        ctx.prisma.chapter.update({
          where: { id: chapter.id },
          data: { position: chapter.position },
        })
      );

      return Promise.all(updatePromises);
    },

    addCourseAttachment: async (
      _: any,
      args: { courseId: string; url: string },
      ctx: Context
    ) => {
      console.log("Adding course attachment", args);
      const { courseId, url } = args;

      const course = await ctx.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) throw new Error("Course not found");

      const name = url.split("/").pop()?.split("?")[0] ?? "attachment";

      return ctx.prisma.attachment.create({
        data: {
          courseId,
          url,
          name,
        },
      });
    },

    deleteCourseAttachment: async (
      _: any,
      args: { courseId: string; attachmentId: string },
      ctx: Context
    ) => {
      const course = await ctx.prisma.course.findUnique({
        where: { id: args.courseId },
      });
      if (!course) throw new Error("Course not found");

      return ctx.prisma.attachment.delete({
        where: { id: args.attachmentId },
      });
    },

    publishChapter: async (
      _: any,
      args: { chapterId: string },
      ctx: Context
    ) => {
      return ctx.prisma.chapter.update({
        where: { id: args.chapterId },
        data: { isPublished: true },
      });
    },

    unpublishChapter: async (
      _: any,
      args: { chapterId: string },
      ctx: Context
    ) => {
      return ctx.prisma.chapter.update({
        where: { id: args.chapterId },
        data: { isPublished: false },
      });
    },

    deleteChapter: async (
      _: any,
      args: { chapterId: string },
      ctx: Context
    ) => {
      return ctx.prisma.chapter.delete({
        where: { id: args.chapterId },
      });
    },

    enrollInCourse: async (
      _: any,
      args: {
        wallet: string;
        courseId: string;
        enrolledVia: string;
        txHash: string;
      },
      ctx: Context
    ) => {
      const { wallet, courseId, enrolledVia, txHash } = args;
      const normalizedWallet = wallet.toLowerCase();

      const course = await ctx.prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) throw new Error("Course not found");

      const existingPurchase = await ctx.prisma.purchase.findUnique({
        where: {
          wallet_courseId: {
            wallet: normalizedWallet,
            courseId,
          },
        },
      });

      if (!existingPurchase) {
        await ctx.prisma.purchase.create({
          data: {
            wallet: normalizedWallet,
            courseId,
          },
        });
      }

      const existingEnrollment = await ctx.prisma.enrollment.findFirst({
        where: {
          wallet: normalizedWallet,
          courseId,
        },
      });

      if (existingEnrollment) return existingEnrollment;

      return ctx.prisma.enrollment.create({
        data: {
          wallet: normalizedWallet,
          courseId,
          enrolledVia,
          txHash,
        },
      });
    },
  },
};
