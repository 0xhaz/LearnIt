import { Button } from "@/components/ui/button";
import Link from "next/link";

const CoursePage = () => {
  return (
    <div className="p6">
      <Link href="/teacher/create">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Create Course
        </Button>
      </Link>
    </div>
  );
};

export default CoursePage;
