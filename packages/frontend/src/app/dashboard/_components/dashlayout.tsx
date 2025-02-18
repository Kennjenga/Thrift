"use client";
import React from "react";
// import Image from "next/image";
import Link from "next/link";
import Navbar from "./navbar";

function SideNav() {
  return (
    <div className="h-[calc(100vh-64px)] bg-accent text-black p-4 ticky top-0 z-50 backdrop-blur-md border-b border-[#5E6C58]/10 shadow-soft">
      {/* Navigation Links */}
      <nav className="space-y-4 mt-10">
        <Link href="/dashboard" className="block hover:text-gray-300">
          Dashboard
        </Link>
        <Link href="/dashboard/thrift" className="block hover:text-gray-300">
          Thrift Tokens
        </Link>
        <Link
          href="/dashboard/manage-clothes"
          className="block hover:text-gray-300"
        >
          Manage Clothes
        </Link>
        <Link
          href="/dashboard/manage-donation"
          className="block hover:text-gray-300"
        >
          Donation centers
        </Link>
      </nav>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <aside className="fixed top-16 bottom-0 md:w-64 hidden md:block">
          <SideNav />
        </aside>
        <main className="flex-1 md:ml-64">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
