import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata: Metadata = {
  title: "Pressure Cooker Whistle Counter",
  description: "An intuitive app to count pressure cooker whistles and notify you when your food is ready. Perfect for precise cooking and multitasking in the kitchen.",
  openGraph: {
    title: "Pressure Cooker Whistle Counter",
    description: "Never overcook again! Count whistles, set targets, and get notified when your pressure-cooked meal is ready.",
    type: "website",
    url: "https://your-app-url.com", // Replace with your actual URL
    images: [
      {
        url: "https://your-app-url.com/og-image.jpg", // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: "Pressure Cooker Whistle Counter App Interface",
      },
    ],
    siteName: "Pressure Cooker Whistle Counter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pressure Cooker Whistle Counter",
    description: "Count whistles, set targets, and perfect your pressure cooking with our easy-to-use app.",
    images: ["https://your-app-url.com/twitter-image.jpg"], // Replace with your actual image URL
  },
  keywords: ["pressure cooker", "cooking app", "kitchen timer", "whistle counter", "cooking helper"],
  authors: [{ name: "Kamlesh Paul" }],
  creator: "Kamlesh Paul",
  publisher: "Kamlesh Paul",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >{children}</body>
    </html>
  );
}
