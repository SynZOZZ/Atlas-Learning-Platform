import type { Metadata } from "next";
import "./globals.css";
import PwaRegister from "../components/pwa-register";

export const metadata: Metadata = {
  title: "4Z Academy",
  description: "A secure bilingual learning platform for recorded and live courses.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/4z-academy-logo.png",
    shortcut: "/assets/4z-academy-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
