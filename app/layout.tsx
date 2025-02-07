import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Page } from "@arbetsmarknad/components/Page";
import { HeaderMenu } from "@arbetsmarknad/components/HeaderMenu";
import { Footer } from "@arbetsmarknad/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Page>
          <HeaderMenu
            href="https://lagstiftning.github.io"
            text="lagstiftning.github.io"
          />
          {children}
          <Footer
            sourceCode={[
              `lagstiftning/${process.env.NEXT_PUBLIC_LAW}`,
              "lagstiftning/lagstiftning.github.io",
              "arbetsmarknad/components",
            ]}
          />
        </Page>{" "}
      </body>
    </html>
  );
}
