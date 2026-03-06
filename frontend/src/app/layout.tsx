import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScaleIndicator from "@/components/ScaleIndicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "Project management board",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster position="bottom-right" />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
        <ScaleIndicator />
      </body>
    </html>
  );
}
