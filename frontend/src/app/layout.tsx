import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Project management board",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster position="bottom-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
