import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "../config";
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
  const initialState = cookieToInitialState(
    config,
    (await headers()).get("cookie")
  );

  return (
    <html lang="en">
      <Head>
        {/* Add the favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body
        className={`flex flex-col min-h-screen bg-green-50 mx-auto max-w-[98%] sm:max-w-[94%]`}
        style={{
          fontFamily: "Inter",
        }}
      >
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
