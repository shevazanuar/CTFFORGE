import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CTFForge | Cybersecurity Learning, CTF & Bug Bounty Simulator",
  description: "Platform pembelajaran cyber security interaktif yang menggabungkan materi course, latihan Capture The Flag (CTF), simulasi Bug Bounty, dan AI Challenge Authoring Assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cyber-bg text-gray-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
