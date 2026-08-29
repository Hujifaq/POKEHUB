import { Bungee, Press_Start_2P, Archivo_Black, Space_Mono, Instrument_Serif } from "next/font/google";
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

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
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
      className={`${bungee.variable} ${pressStart.variable} ${archivoBlack.variable} ${spaceMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="m-0 p-0 bg-primary-base">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

