"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedValue) {
      params.set("title", debouncedValue);
    }

    if (currentCategoryId) {
      params.set("categoryId", currentCategoryId);
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedValue, currentCategoryId, pathname, router]);

  return (
    <div className="relative">
      <Search className="absolute h-4 w-4 top-3 left-3 text-foreground" />
      <Input
        onChange={e => setValue(e.target.value)}
        value={value}
        className="w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search for courses"
      />
    </div>
  );
};
