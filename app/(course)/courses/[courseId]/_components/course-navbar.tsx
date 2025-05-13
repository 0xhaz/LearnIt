import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { NavbarRoutes } from "@/components/navbar-routes";
import { CourseSidebarChapter } from "@/types";

interface CourseNavbarProps {
  course: {
    id: string;
    title: string;
    chapters: CourseSidebarChapter[];
  };
  progressCount: number;
}

export const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  );
};
