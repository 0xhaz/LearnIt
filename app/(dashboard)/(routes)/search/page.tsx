import { redirect } from "next/navigation";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { getClient } from "@/lib/graphql-client";
import { getCourses } from "@/actions/get-courses";
import { GET_CATEGORIES } from "@/graphql/queries/get-categories";
import { SearchInput } from "@/components/search-input";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { GetCategoriesResponse } from "@/types";

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const wallet = await getWalletAddress();
  if (!wallet) return redirect("/");

  const client = getClient();
  const { categories } = await client.request<GetCategoriesResponse>(
    GET_CATEGORIES
  );

  const courses = await getCourses({
    userId: wallet,
    ...searchParams,
  });

  return (
    <>
      <div className="px-4 pt-4 md:!hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
