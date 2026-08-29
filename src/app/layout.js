import { Bungee, Press_Start_2P } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

const bungee = Bungee({
  weight: "400",
  variable: "--font-bungee",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata = {
  title: "POKERHUB",
  description: "Y2K Retro Poker Experience",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bungee.variable} ${pressStart.variable} antialiased`}
    >
      <body className="m-0 p-0 bg-primary-base">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

