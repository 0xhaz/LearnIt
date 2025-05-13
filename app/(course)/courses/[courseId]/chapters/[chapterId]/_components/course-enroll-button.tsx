"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useState } from "react";
import toast from "react-hot-toast";
import { getClient } from "@/lib/graphql-client";
// import { CREATE_CHECKOUT } from "@/graphql/mutations/create-checkout";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      //   setIsLoading(true);
      //   const client = getClient();
      //   const { createCheckout } = await client.request<{
      //     createCheckout: { url: string };
      //   }>(CREATE_CHECKOUT, {
      //     courseId,
      //   });
      //   window.location.assign(createCheckout.url);
    } catch (error) {
      //   toast.error("Something went wrong. Please try again.");
      //   console.error("[ENROLL_ERROR]", error);
    } finally {
      //   setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      Enroll for {formatPrice(price)}
    </Button>
  );
};
