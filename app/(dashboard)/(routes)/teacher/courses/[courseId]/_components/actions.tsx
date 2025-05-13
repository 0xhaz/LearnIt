"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { Trash } from "lucide-react";

import { ConfirmModal } from "@/components/modals/confim-modal";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { getClient } from "@/lib/graphql-client";
import { PUBLISH_COURSE } from "@/graphql/mutations/publish-course";
import { DELETE_COURSE } from "@/graphql/mutations/delete-course";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
}

export const Actions = ({ disabled, courseId, isPublished }: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      const client = getClient();

      await client.request(PUBLISH_COURSE, {
        wallet: address,
        courseId,
        isPublished: !isPublished,
      });

      toast.success(
        `Course ${isPublished ? "unpublished" : "published"} successfully`
      );
      if (!isPublished) confetti.onOpen();
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      const client = getClient();

      await client.request(DELETE_COURSE, {
        wallet: address,
        courseId,
      });

      toast.success("Course deleted successfully");
      router.push("/teacher/courses");
      router.refresh();
    } catch {
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
