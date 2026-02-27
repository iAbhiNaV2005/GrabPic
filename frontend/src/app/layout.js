import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "GrabPic — Find Yourself in Group Photos",
  description:
    "Upload group trip photos, share a link, and let AI find the photos you appear in. Powered by facial recognition.",
  keywords: ["photo sharing", "facial recognition", "group photos", "AI", "face search"],
  openGraph: {
    title: "GrabPic — Find Yourself in Group Photos",
    description: "Upload group trip photos, share a link, and let AI find the photos you appear in.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 160px)", position: "relative", zIndex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
