import { Bungee, Press_Start_2P } from "next/font/google";
import "./globals.css";

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
      className={`${bungee.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col m-0 p-0 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
