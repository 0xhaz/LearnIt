import { redirect } from "next/navigation";
import { getWalletAddress } from "@/lib/get-wallet-server";
import { getClient } from "@/lib/graphql-client";
import { GET_COURSES_BY_WALLET } from "@/graphql/queries/get-courses-by-wallet";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { GetCoursesByWalletResponse } from "@/types";

const CoursesPage = async () => {
  const wallet = await getWalletAddress();

  if (!wallet) return redirect("/");

  const client = getClient();
  const { coursesByWallet: courses } =
    await client.request<GetCoursesByWalletResponse>(GET_COURSES_BY_WALLET, {
      wallet,
    });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursesPage;
