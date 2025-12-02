import { useState, useEffect } from "react";

interface CityImageData {
  url: string;
  thumb?: string;
  small?: string;
  author?: string;
  authorUrl?: string;
  source?: string;
  cached?: boolean;
}

interface UseCityImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  imageData: CityImageData | null;
}

/**
 * Caché en localStorage para imágenes de ciudades
 * Clave: "city-image-cache", Valor: Map<string, { url, timestamp }>
 */
const STORAGE_KEY = "city-image-cache";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

function getCacheKey(destination: string, city?: string | null, country?: string | null): string {
  if (destination) return destination.toLowerCase().trim();
  if (city && country) return `${city.toLowerCase().trim()}, ${country.toLowerCase().trim()}`;
  if (city) return city.toLowerCase().trim();
  return "";
}

function getCachedImage(cacheKey: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const cache = JSON.parse(cached);
    const entry = cache[cacheKey];
    
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.url;
    }

    // Limpiar entrada expirada
    delete cache[cacheKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    return null;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

function setCachedImage(cacheKey: string, url: string): void {
  if (typeof window === "undefined") return;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    const cache = cached ? JSON.parse(cached) : {};
    
    cache[cacheKey] = {
      url,
      timestamp: Date.now(),
    };

    // Limitar tamaño del caché (mantener solo las últimas 100 entradas)
    const entries = Object.entries(cache);
    if (entries.length > 100) {
      // Ordenar por timestamp y mantener solo las más recientes
      entries.sort((a, b) => (b[1] as { timestamp: number }).timestamp - (a[1] as { timestamp: number }).timestamp);
      const limitedCache: Record<string, { url: string; timestamp: number }> = {};
      entries.slice(0, 100).forEach(([key, value]) => {
        limitedCache[key] = value as { url: string; timestamp: number };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedCache));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error("Error writing cache:", error);
    // Si el localStorage está lleno, intentar limpiar entradas antiguas
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const cache = JSON.parse(cached);
        const entries = Object.entries(cache);
        entries.sort((a, b) => (b[1] as { timestamp: number }).timestamp - (a[1] as { timestamp: number }).timestamp);
        const limitedCache: Record<string, { url: string; timestamp: number }> = {};
        entries.slice(0, 50).forEach(([key, value]) => {
          limitedCache[key] = value as { url: string; timestamp: number };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedCache));
      }
    } catch (e) {
      // Si aún falla, limpiar todo el caché
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Hook personalizado para obtener imágenes de ciudades
 * 
 * @param destination - El destino del viaje (ciudad, país, etc.)
 * @param city - Nombre de la ciudad (opcional)
 * @param country - Nombre del país (opcional)
 * @returns Objeto con la URL de la imagen, estado de carga y errores
 */
export function useCityImage(
  destination: string | null | undefined,
  city?: string | null,
  country?: string | null
): UseCityImageResult {
  const [imageData, setImageData] = useState<CityImageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay destino, no hacer nada
    if (!destination) {
      setImageData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cacheKey = getCacheKey(destination, city, country);
    
    // Verificar caché local primero
    const cachedUrl = getCachedImage(cacheKey);
    if (cachedUrl) {
      setImageData({ url: cachedUrl, cached: true });
      setIsLoading(false);
      setError(null);
      return;
    }

    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    if (destination) {
      params.append("destination", destination);
    }
    if (city) {
      params.append("city", city);
    }
    if (country) {
      params.append("country", country);
    }

    setIsLoading(true);
    setError(null);

    // Hacer petición a la API
    fetch(`/api/city-image?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            // No se encontró imagen, pero no es un error crítico
            setImageData(null);
            setError(null);
            return null;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: CityImageData | null) => {
        if (data && data.url) {
          // Guardar en caché local
          setCachedImage(cacheKey, data.url);
          setImageData(data);
          setError(null);
        } else {
          setImageData(null);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching city image:", err);
        setImageData(null);
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [destination, city, country]);

  return {
    imageUrl: imageData?.url || null,
    isLoading,
    error,
    imageData,
  };
}

