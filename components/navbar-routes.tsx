"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { setCookie } from "cookies-next";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";
import { ToggleMode } from "./toggle-mode";

export const NavbarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (!address) return;

      setCookie("wallet", address, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      const res = await fetch(`/api/account?wallet=${address}`);
      const { exists } = await res.json();

      if (!exists && pathname !== "/sign-up") {
        router.push("/sign-up");
      }
    };

    if (isConnected) checkUser();
  }, [isConnected, address, pathname, router]);

  if (!isMounted) return null;

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isPlayerPage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/search";

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:!block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto items-center">
        {!isConnected ? (
          <ConnectKitButton />
        ) : (
          <>
            {isTeacherPage || isPlayerPage ? (
              <Link href="/">
                <Button size="sm" variant="ghost">
                  <LogOut className="h-4 w-4 mr-2" />
                  Exit
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/courses">
                  <Button size="sm" variant="secondary">
                    Course
                  </Button>
                </Link>
                <Link href="/teacher/courses">
                  <Button size="sm" variant="ghost">
                    Teacher Mode
                  </Button>
                </Link>
              </>
            )}
            <ConnectKitButton />
            <ToggleMode />
          </>
        )}
      </div>
    </>
  );
};
