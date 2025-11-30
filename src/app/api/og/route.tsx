import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function loadLogo() {
  try {
    // En Edge Runtime, necesitamos cargar la imagen como ArrayBuffer
    // y convertirla a base64 para usarla en ImageResponse
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const logoUrl = `${baseUrl}/icon.png`;
    
    // Si estamos en producción y la URL es absoluta, usar fetch
    if (logoUrl.startsWith("http")) {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        return `data:image/png;base64,${base64}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error loading logo:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Shop Trip";
    const description =
      searchParams.get("description") ||
      "Organiza las compras de tus viajes de forma inteligente";
    
    // Cargar el logo
    const logoDataUrl = await loadLogo();

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Icon/Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "160px",
                height: "160px",
                borderRadius: "32px",
                background:
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                marginBottom: "48px",
                boxShadow: "0 25px 70px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                position: "relative",
                padding: "20px",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt="Shop Trip Logo"
                  width={120}
                  height={120}
                  style={{
                    borderRadius: "20px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  ST
                </div>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 30 ? "64px" : "72px",
                fontWeight: "800",
                color: "white",
                marginBottom: "28px",
                textAlign: "center",
                lineHeight: "1.1",
                maxWidth: "1000px",
                letterSpacing: "-0.02em",
                textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "28px",
                color: "#cbd5e1",
                textAlign: "center",
                maxWidth: "900px",
                lineHeight: "1.5",
                marginTop: "0",
                fontWeight: "400",
              }}
            >
              {description}
            </p>

            {/* Brand name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "56px",
                padding: "16px 32px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                  boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)",
                }}
              />
              <span
                style={{
                  fontSize: "24px",
                  color: "#e2e8f0",
                  fontWeight: "600",
                  letterSpacing: "0.05em",
                }}
              >
                SHOP TRIP
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#9333ea",
                  boxShadow: "0 0 12px rgba(147, 51, 234, 0.6)",
                }}
              />
            </div>
          </div>

          {/* Bottom accent */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error("Error generating OG image:", e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}

