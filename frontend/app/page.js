'use client';
import NotConnected from "@/components/NotConnected";
import C2P from "@/components/C2P";

import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <C2P />
      ) : (
        <NotConnected />
      )}
    </>
  );
}