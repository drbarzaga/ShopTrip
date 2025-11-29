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
  title: "Shop Trip | Organiza tus compras de viaje",
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
      <Script
        id="pwa-splash-inline"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Detectar tema preferido (dark/light)
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
                      <img 
                        src="/icon.png" 
                        alt="Shop Trip" 
                        style="
                          width: 64px;
                          height: 64px;
                          animation: bounce 1s infinite;
                        "
                      />
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
