import { redirect } from "next/navigation";

import { getClient } from "@/lib/graphql-client";
import { GET_COURSE_WITH_ID } from "@/graphql/queries/get-course-with-id";
import { GET_CATEGORIES } from "@/graphql/queries/get-categories";

import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { getWalletAddress } from "@/lib/get-wallet-server";

import {
  LayoutDashboard,
  ListChecks,
  CircleDollarSign,
  File,
} from "lucide-react";
import { Actions } from "./_components/actions";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import {
  GetCourseWithIdResponse,
  GetCategoriesResponse,
  Course,
  Attachment,
} from "@/types";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const wallet = (await getWalletAddress())?.toLowerCase();

  if (!wallet) {
    return redirect("/");
  }

  const client = getClient();

  const { courseById: course } = await client.request<GetCourseWithIdResponse>(
    GET_COURSE_WITH_ID,
    { id: params.courseId }
  );

  const { categories } = await client.request<GetCategoriesResponse>(
    GET_CATEGORIES
  );

  if (!course || course.wallet.toLowerCase() !== wallet.toLowerCase()) {
    return redirect("/");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some(c => c.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const isComplete = requiredFields.every(Boolean);
  const completionText = `(${completedFields} of ${totalFields})`;

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is not published yet and will not be visible to students." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm
              initialData={{ description: course.description ?? null }}
              courseId={course.id}
            />
            <ImageForm
              initialData={{ imageUrl: course.imageUrl ?? null }}
              courseId={course.id}
            />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map(category => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm
                initialData={{
                  price: course.price,
                  description: course.description ?? "",
                }}
                courseId={course.id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments</h2>
              </div>
              <AttachmentForm
                initialData={
                  course as Course & {
                    attachments: Attachment[];
                    enrollments: any[];
                  }
                }
                courseId={course.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
