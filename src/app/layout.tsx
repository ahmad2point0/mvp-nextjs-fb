import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { QueryProvider } from "@/global/providers/query-provider";
import { AuthProvider } from "@/global/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSEAS - Community Support & Education Aid System",
  description:
    "Connecting donors, volunteers, and underprivileged students to empower education and build communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceCodePro.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
