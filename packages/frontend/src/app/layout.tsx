import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Ace",
  description: "A clothes exchange e-commerce platform for everyone",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Add the favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body
        className={`flex flex-col min-h-screen bg-green-50 mx-auto w-full`}
        style={{
          fontFamily: "Inter",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
