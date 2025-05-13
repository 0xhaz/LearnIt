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
    courses: async (_parent: any, _args: any, ctx: Context) => {
      return ctx.prisma.course.findMany({
        include: { chapters: true },
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

    chapterById: async (_: any, args: { id: string }, ctx: Context) => {
      return ctx.prisma.chapter.findUnique({
        where: { id: args.id },
        include: { muxData: true },
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
          input: data.videoUrl,
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
  },
};
