"use client";

import { File, Loader2, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Attachment, Course } from "@/types";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { getClient } from "@/lib/graphql-client";
import { ADD_COURSE_ATTACHMENT } from "@/graphql/mutations/add-course-attachment";
import { DELETE_COURSE_ATTACHMENT } from "@/graphql/mutations/delete-course-attachment";

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

export const AttachmentForm = ({
  initialData,
  courseId,
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => setIsEditing(current => !current);

  const onSubmit = async (url: string) => {
    try {
      const client = getClient();
      await client.request(ADD_COURSE_ATTACHMENT, { courseId, url });
      toast.success("Attachment added");
      router.refresh();
      toggleEdit();
    } catch {
      toast.error("Failed to add attachment");
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const client = getClient();
      await client.request(DELETE_COURSE_ATTACHMENT, {
        courseId,
        attachmentId: id,
      });
      toast.success("Attachment removed");
      router.refresh();
    } catch {
      toast.error("Failed to delete attachment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-accent rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!isEditing && initialData.attachments.length === 0 && (
        <p className="text-sm mt-2 text-slate-500 italic">
          No attachments yet. Click on the button above to add one.
        </p>
      )}

      {!isEditing && initialData.attachments.length > 0 && (
        <div className="space-y-2 mt-2">
          {initialData.attachments.map((attachment: Attachment) => (
            <div
              key={attachment.id}
              className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
            >
              <File className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-xs line-clamp-1">{attachment.name}</p>
              {deletingId === attachment.id ? (
                <Loader2 className="ml-auto animate-spin h-4 w-4" />
              ) : (
                <button
                  onClick={() => onDelete(attachment.id)}
                  className="ml-auto hover:opacity-75 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={url => {
              if (url) onSubmit(url);
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Add anything from images to documents. You can add multiple files.
          </div>
        </div>
      )}
    </div>
  );
};
