import { useEffect, useState } from "react";
import { client } from "./client";
import { useAccount } from "wagmi";

export const useLensProfile = () => {
  const { address } = useAccount();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!address) return;

    const fetchProfile = async () => {
      const result = await client;
    };
  });
};
