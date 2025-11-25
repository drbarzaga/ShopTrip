import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { PWASplashScreen } from "@/components/pwa-splash-screen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Trip",
  description:
    "A simple tool to manage and organize the items you need to buy for your trip",
  manifest: "/manifest.json",
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
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
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
      <Script
        id="pwa-splash-inline"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Detectar tema preferido
              const theme = localStorage.getItem('theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
              
              // Prevenir flash estableciendo background inmediatamente
              document.documentElement.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#eff6ff';
              
              // Función para crear e insertar el splash screen
              function createSplashScreen() {
                if (document.getElementById('pwa-splash-screen-inline')) {
                  return; // Ya existe
                }
                
                // Crear splash screen inmediatamente antes de que React cargue
                const splashHTML = \`
                <div id="pwa-splash-screen-inline" style="
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  z-index: 99999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: linear-gradient(to bottom right, \${theme === 'dark' ? '#0f172a, #111827, #0f172a' : '#eff6ff, #ffffff, #eff6ff'});
                  opacity: 1;
                  transition: opacity 0.5s ease-out;
                ">
                  <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    animation: fadeIn 0.5s ease-out;
                  ">
                    <div style="position: relative;">
                      <div style="
                        position: absolute;
                        inset: 0;
                        background: rgba(59, 130, 246, 0.2);
                        border-radius: 1.5rem;
                        filter: blur(2rem);
                        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                      "></div>
                      <div style="
                        position: relative;
                        background: linear-gradient(to bottom right, \${theme === 'dark' ? '#2563eb, #1d4ed8' : '#3b82f6, #2563eb'});
                        border-radius: 1.5rem;
                        padding: 1.5rem;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                      ">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="
                          color: white;
                          animation: bounce 1s infinite;
                        ">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <div style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
                      <h1 style="
                        font-size: 1.875rem;
                        font-weight: 700;
                        color: \${theme === 'dark' ? '#ffffff' : '#111827'};
                        letter-spacing: -0.025em;
                        margin: 0;
                        animation: fadeIn 0.7s ease-out;
                      ">Shop Trip</h1>
                      <p style="
                        font-size: 0.875rem;
                        color: \${theme === 'dark' ? '#9ca3af' : '#4b5563'};
                        margin: 0;
                        animation: fadeIn 0.7s ease-out 0.1s both;
                      ">Organiza tus compras de viaje</p>
                    </div>
                    <div style="
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                      animation: fadeIn 0.7s ease-out 0.2s both;
                    ">
                      <div style="
                        width: 0.5rem;
                        height: 0.5rem;
                        background: \${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                        border-radius: 9999px;
                        animation: bounce 1s infinite -0.3s;
                      "></div>
                      <div style="
                        width: 0.5rem;
                        height: 0.5rem;
                        background: \${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                        border-radius: 9999px;
                        animation: bounce 1s infinite -0.15s;
                      "></div>
                      <div style="
                        width: 0.5rem;
                        height: 0.5rem;
                        background: \${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                        border-radius: 9999px;
                        animation: bounce 1s infinite;
                      "></div>
                    </div>
                  </div>
                </div>
                <style>
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-0.5rem); }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                </style>
              \`;
              
                // Insertar splash screen inmediatamente
                if (document.body) {
                  document.body.insertAdjacentHTML('afterbegin', splashHTML);
                } else {
                  // Si el body no está listo, esperar a que esté disponible
                  document.addEventListener('DOMContentLoaded', function() {
                    if (!document.getElementById('pwa-splash-screen-inline')) {
                      document.body.insertAdjacentHTML('afterbegin', splashHTML);
                    }
                  });
                }
                
                // Marcar que el splash está listo para ser controlado por React
                window.__PWA_SPLASH_READY__ = true;
              }
              
              // Intentar crear el splash screen inmediatamente
              if (document.body) {
                createSplashScreen();
              } else {
                // Si el body no está disponible, esperar
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', createSplashScreen);
                } else {
                  // DOM ya está listo
                  setTimeout(createSplashScreen, 0);
                }
              }
            })();
          `,
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Splash Screen para PWA */}
        <PWASplashScreen />
        
        {/* OneSignal SDK Script - desde CDN según documentación oficial */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="lazyOnload"
          defer
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
