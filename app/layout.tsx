import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude's Shopping List",
  description: "A smart shopping list manager to track your items with categories, quantities, and purchase status",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
