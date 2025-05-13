import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { CourseSidebar } from "./course-sidebar";
import { CourseSidebarChapter } from "@/types";

interface CourseMobileSidebarProps {
  course: {
    id: string;
    title: string;
    chapters: CourseSidebarChapter[];
  };
  progressCount: number;
}

export const CourseMobileSidebar = ({
  course,
  progressCount,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-72">
        <CourseSidebar courseId={course.id} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
