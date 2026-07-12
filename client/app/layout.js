import { Barlow, Barlow_Semi_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Type system — a transport / wayfinding lineage.
// Barlow was drawn from California highway signage and public-transit lettering,
// so it grounds the whole console in the subject. Semi Condensed carries the
// display voice; the regular width handles UI text; IBM Plex Mono is the
// "instrument" face for every figure, plate and identifier.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-cond",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata = {
  title: "TransitOps — Smart Transport Operations",
  description:
    "Fleet, driver, dispatch, maintenance and expense operations platform.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlow.variable} ${barlowCondensed.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        {/* Apply the saved theme before paint so dark users never flash light.
            Light is the default when nothing is stored. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
