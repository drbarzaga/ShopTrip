import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { PWASplashScreen } from "@/components/pwa-splash-screen";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { OfflineProvider } from "@/components/offline-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Shop Trip | Organiza las compras de tu viaje",
  description:
    "Organiza las compras de tus viajes de forma inteligente. Crea listas, rastrea gastos y mantén todo organizado antes y durante tus viajes.",
  manifest: "/manifest.json",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Shop Trip | Organiza las compras de tu viaje",
    description:
      "Organiza las compras de tus viajes de forma inteligente. Crea listas, rastrea gastos y mantén todo organizado antes y durante tus viajes.",
    url: baseUrl,
    siteName: "Shop Trip",
    images: [
      {
        url: "/api/og?title=Shop Trip&description=Organiza las compras de tus viajes de forma inteligente",
        width: 1200,
        height: 630,
        alt: "Shop Trip - Organiza las compras de tu viaje",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Trip | Organiza las compras de tu viaje",
    description:
      "Organiza las compras de tus viajes de forma inteligente. Crea listas, rastrea gastos y mantén todo organizado antes y durante tus viajes.",
    images: [
      "/api/og?title=Shop Trip&description=Organiza las compras de tus viajes de forma inteligente",
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shop Trip",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Shop Trip",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              // Detectar tema preferido (dark/light) - solo modificar clases, no el DOM
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
                
                // Detectar tema de color
                const colorTheme = localStorage.getItem('color-theme') || 'slate';
                document.documentElement.setAttribute('data-theme', colorTheme);
                
                // Detectar fuente
                const fontFamily = localStorage.getItem('font-family') || 'geist';
                document.documentElement.setAttribute('data-font', fontFamily);
                
                // Cargar fuente si no es geist
                if (fontFamily !== 'geist') {
                  const fontMap = {
                    inter: 'Inter:wght@300;400;500;600;700',
                    roboto: 'Roboto:wght@300;400;500;700',
                    'open-sans': 'Open+Sans:wght@300;400;500;600;700',
                    lato: 'Lato:wght@300;400;700',
                    montserrat: 'Montserrat:wght@300;400;500;600;700',
                    poppins: 'Poppins:wght@300;400;500;600;700',
                    raleway: 'Raleway:wght@300;400;500;600;700',
                    nunito: 'Nunito:wght@300;400;500;600;700',
                    'source-sans': 'Source+Sans+Pro:wght@300;400;600;700',
                  };
                  const fontUrl = fontMap[fontFamily];
                  if (fontUrl && !document.getElementById('font-' + fontFamily)) {
                    const link = document.createElement('link');
                    link.id = 'font-' + fontFamily;
                    link.rel = 'stylesheet';
                    link.href = 'https://fonts.googleapis.com/css2?family=' + fontUrl + '&display=swap';
                    document.head.appendChild(link);
                  }
                }
                
                // Prevenir flash estableciendo background inmediatamente
                document.documentElement.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#eff6ff';
              } catch (e) {
                // Ignorar errores en SSR
              }
            })();
          `,
          }}
        />
        {/* Splash Screen para PWA */}
        <PWASplashScreen />

        {/* OneSignal SDK Script - desde CDN según documentación oficial */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="lazyOnload"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider />
          <OfflineProvider>
            {children}
          </OfflineProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
