import type { Metadata } from "next";

import "@/app/globals.css";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "FIF Web App",
  description: "Formularios FIF com Next.js, Turso e Drizzle.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <div className="app-shell">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
