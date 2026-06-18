import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/szz/site-nav";
import { SiteFooter } from "@/components/szz/site-footer";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.serverizz.com"),
  title: {
    default: "SERVERIZZ — Managed hosting for small business",
    template: "%s · SERVERIZZ",
  },
  description:
    "Claim your domain, then launch a fast, fully-managed website on it — email, SSL and daily backups included. Free migration on every plan.",
  openGraph: {
    title: "SERVERIZZ — Managed hosting for small business",
    description:
      "Ship infrastructure. Ship software. Ship brands. Fully-managed hosting, WordPress and domains for small business.",
    type: "website",
  },
};

// Set the theme attribute before paint so there's no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem('szz-theme')||'dark';var r=(t==='system')?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div style={{ minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
