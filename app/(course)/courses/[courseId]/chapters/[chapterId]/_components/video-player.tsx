"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { updateProgress } from "@/graphql/mutations/update-progress";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await updateProgress({ chapterId, isCompleted: true });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Chapter completed!");
        await delay(500);
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">
            This chapter is locked. Please purchase the course to unlock it.
          </p>
        </div>
      )}
      {!isLocked && (
        <MuxPlayer
          title={title}
          className={cn(!isReady && "hidden")}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
        />
      )}
    </div>
  );
};
