import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMO Ticket Triage",
  description: "A lightweight triage dashboard for the Bistec PMO.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-800 antialiased">{children}</body>
    </html>
  );
}
