import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vestígios RPG — Sistema de Fichas",
  description: "Sistema de fichas digitais para Vestígios RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-background text-foreground font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
