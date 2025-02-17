"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "./navbar";

function SideNav() {
  return (
    <div className="h-screen bg-accent text-black p-4 bg-green-200">
      {/* App Logo */}
      <div className="mb-8">
        <Link href="/">
          <Image
            src="/my-business-name-high-resolution-logo-transparent.png"
            alt="App Logo"
            width={150}
            height={50}
            className="mx-auto"
          />
        </Link>
      </div>
      {/* Navigation Links */}
      <nav className="space-y-4">
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
    <div className="flex">
      <aside className="fixed md:w-64 hidden md:block">
        <SideNav />
      </aside>
      <main className="flex-1 md:ml-64">
        <Navbar />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
