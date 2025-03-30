import type React from "react";
import "./globals.css";
import { Montserrat, Poppins } from "next/font/google";

// Load Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
});

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "QuickContainerImageScan",
  description:
    "Tool for scanning container images for vulnerabilities and licenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
