import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

/**
 * Outfit para perguntas e titulos (geometrica, jovem, com personalidade),
 * Inter para corpo (a mais legivel em tela pequena). Ambas com latin-ext,
 * que e o que garante acentuacao correta em portugues.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Missões",
    template: "%s · Missões",
  },
  description:
    "Aulas cristãs com adolescentes que viram jornada: situações, escolhas e reflexão a partir da Bíblia.",
};

export const viewport: Viewport = {
  themeColor: "#14101f",
  // Deixa o conteudo ir ate a borda em celulares com notch; o safe-area e
  // tratado nos componentes de tela do jogador.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
