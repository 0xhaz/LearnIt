"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";

import { getClient } from "@/lib/graphql-client";
import { REGISTER_USER } from "@/graphql/mutations/register-user";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SignUpRoutes = () => {
  const { address } = useAccount();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    lensHandle: "",
    lensProfileId: "",
  });

  const handleSubmit = async () => {
    try {
      const client = getClient();

      await client.request(REGISTER_USER, {
        wallet: address,
        ...form,
      });

      router.push(form.role === "teacher" ? "/teacher/courses" : "/courses");
      router.refresh();
    } catch (error) {
      console.error("Error registering user:", error);
      const typedError = error as any;
      if (typedError.response?.errors) {
        console.error("GraphQL errors:", typedError.response.errors);
      }
      if (typedError.response?.data) {
        console.error("GraphQL response data:", typedError.response.data);
      }
    }
  };

  if (!address) return <p>Please connect your wallet first</p>;
  return (
    <main className="bg-background text-foreground h-screen flex items-center justify-center p-10 ">
      <div className="grid w-full h-full grid-cols-1 bg-white box-anim md:grid-cols-2 ">
        <div className="bg-[#16202a] text-white flex items-center justify-center flex-col">
          <div className="my-4 flex flex-col items-center">
            <h1 className="text-3xl font-semibold ">Sign Up</h1>
            <p className="mt-2 text-xs text-slate-400">
              Grow your skills with us. Join the community of learners and
              teachers.
            </p>
          </div>
          <div>
            <Button
              className="flex items-center w-full gap-4 px-12 mb-4 bg-background text-foreground rounded-full"
              variant="outline"
            >
              {" "}
              <FcGoogle size="25" />
              Sign Up With Google
            </Button>

            <Label htmlFor="name">Name*</Label>
            <Input
              className="mt-2 mb-4 bg-background text-foreground rounded-full"
              value={form.name}
              placeholder="Name"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Label htmlFor="email">Email*</Label>
            <Input
              className="mt-2 mb-4 bg-background text-foreground rounded-full"
              value={form.email}
              placeholder="Email"
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <Label htmlFor="lensHandle">Lens Handle*</Label>
            <Input
              className="mt-2 mb-4 bg-background text-foreground rounded-full"
              value={form.lensHandle}
              placeholder="Lens Handle"
              onChange={e => setForm({ ...form, lensHandle: e.target.value })}
            />
            <Label htmlFor="lensProfileId">Lens Profile ID*</Label>
            <Input
              className="mt-2 mb-4 bg-background text-foreground rounded-full"
              value={form.lensProfileId}
              placeholder="Lens Profile ID"
              onChange={e =>
                setForm({ ...form, lensProfileId: e.target.value })
              }
            />
            <Label htmlFor="role">Role*</Label>
            <Select
              value={form.role}
              onValueChange={value => setForm({ ...form, role: value })}
            >
              <SelectTrigger className="w-[180px] mt-2 mb-4 bg-background text-foreground rounded-l-lg">
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSubmit}
              type="submit"
              className="w-full mt-6 rounded-full bg-background text-foreground hover:bg-slate-200 hover:text-slate-900 transition-all duration-300"
            >
              Sign Up
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-200">
            @2025 All rights reserved
          </p>
        </div>
        <div className="relative hidden md:block bg-transparent ">
          <Image
            className="object-cover "
            fill={true}
            src="/logo.png"
            alt="bg-image"
          />
        </div>
      </div>
    </main>
  );
};
