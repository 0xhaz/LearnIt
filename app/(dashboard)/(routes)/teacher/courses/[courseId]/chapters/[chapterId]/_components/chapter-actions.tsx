"use client";

import { ConfirmModal } from "@/components/modals/confim-modal";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { getClient } from "@/lib/graphql-client";
import {
  PUBLISH_CHAPTER,
  UNPUBLISH_CHAPTER,
  DELETE_CHAPTER,
} from "@/graphql/mutations/chapter-actions";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const client = getClient();

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await client.request(UNPUBLISH_CHAPTER, { chapterId });
        toast.success("Chapter unpublished successfully");
      } else {
        await client.request(PUBLISH_CHAPTER, { chapterId });
        toast.success("Chapter published successfully");
      }

      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await client.request(DELETE_CHAPTER, { chapterId });
      toast.success("Chapter deleted successfully");
      router.refresh();
      router.push(`/teacher/courses/${courseId}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
