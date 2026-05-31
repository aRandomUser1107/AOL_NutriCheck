"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
    </>
  );
}