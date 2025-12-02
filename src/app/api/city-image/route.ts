import { NextRequest, NextResponse } from "next/server";

/**
 * Caché en memoria para las imágenes de ciudades
 * Clave: query normalizada, Valor: { url, thumb, small, timestamp }
 * Expira después de 7 días
 */
const imageCache = new Map<
  string,
  { url: string; thumb?: string; small?: string; timestamp: number }
>();

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

/**
 * Normaliza el query para usar como clave de caché
 */
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

/**
 * Limpia entradas expiradas del caché
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
}

/**
 * API Route para obtener imágenes de ciudades usando Unsplash
 * 
 * Uso: /api/city-image?city=Paris&country=France
 * 
 * Si no se proporciona una API key de Unsplash, usa Unsplash Source API (gratuita pero limitada)
 * Para mejor rendimiento, obtén una API key gratuita en https://unsplash.com/developers
 * 
 * Implementa caché en memoria para evitar requests repetidas a Unsplash
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const destination = searchParams.get("destination");

    // Si no hay ciudad ni destino, retornar error
    if (!city && !destination) {
      return NextResponse.json(
        { error: "Se requiere el parámetro 'city' o 'destination'" },
        { status: 400 }
      );
    }

    // Construir query de búsqueda mejorada
    let baseQuery = "";
    if (destination) {
      baseQuery = destination;
    } else if (city && country) {
      baseQuery = `${city}, ${country}`;
    } else if (city) {
      baseQuery = city;
    } else {
      baseQuery = destination || "";
    }

    // Limpiar query base (remover caracteres especiales que puedan causar problemas)
    // Pero preservar espacios y comas que son importantes para detectar ciudades
    baseQuery = baseQuery.trim().replace(/[^\w\s,.-]/g, "");

    if (!baseQuery) {
      return NextResponse.json(
        { error: "Query de búsqueda inválida" },
        { status: 400 }
      );
    }
    
    // Normalizar variaciones comunes de países/ciudades antes de procesar
    const normalizedForDetection = baseQuery.toLowerCase().trim();
    
    // Mapeo de variaciones comunes a términos normalizados
    const normalizationMap: Record<string, string> = {
      "brazil": "brasil",
      "brasil": "brasil",
    };
    
    // Normalizar si es necesario
    const normalizedTerm = normalizationMap[normalizedForDetection] || normalizedForDetection;

    // Mejorar la query para obtener imágenes más específicas de ciudades/países
    // Agregar términos que ayuden a encontrar imágenes de ciudades, paisajes urbanos, etc.
    let query = baseQuery;
    
    // Mapeo de ciudades conocidas a sus landmarks/atracciones icónicas
    const cityLandmarksMap: Record<string, string> = {
      "rio de janeiro": "christ the redeemer",
      "rio": "christ the redeemer rio de janeiro",
      "paris": "eiffel tower",
      "parís": "eiffel tower",
      "london": "big ben london",
      "londres": "big ben london",
      "new york": "statue of liberty",
      "nueva york": "statue of liberty",
      "sydney": "sydney opera house",
      "tokyo": "tokyo tower",
      "barcelona": "sagrada familia",
      "rome": "colosseum",
      "roma": "colosseum",
      "dubai": "burj khalifa",
      "istanbul": "hagia sophia",
      "moscow": "red square",
      "moscú": "red square",
      "mumbai": "gateway of india",
      "singapore": "marina bay sands",
      "hong kong": "victoria harbour",
      "san francisco": "golden gate bridge",
      "los angeles": "hollywood sign",
      "buenos aires": "obelisco",
      "lima": "plaza mayor",
      "santiago": "cerro san cristobal",
      "montevideo": "palacio salvo",
      "bogota": "monserrate",
      "quito": "virgen del panecillo",
      "mexico city": "angel de la independencia",
      "ciudad de mexico": "angel de la independencia",
      "madrid": "plaza mayor madrid",
      "berlin": "brandenburg gate",
      "amsterdam": "canals amsterdam",
      "prague": "charles bridge",
      "praga": "charles bridge",
      "athens": "acropolis",
      "atenas": "acropolis",
      "cairo": "pyramids",
      "el cairo": "pyramids",
      "bangkok": "wat phra kaew",
      "seoul": "namsan tower",
      "beijing": "forbidden city",
      "pekin": "forbidden city",
    };

    // Lista de países comunes y sus capitales/ciudades principales para búsqueda
    const countryToCityMap: Record<string, string> = {
      brasil: "rio de janeiro",
      brazil: "rio de janeiro",
      argentina: "buenos aires",
      chile: "santiago",
      uruguay: "montevideo",
      paraguay: "asuncion",
      colombia: "bogota",
      peru: "lima",
      ecuador: "quito",
      venezuela: "caracas",
      mexico: "ciudad de mexico",
      españa: "madrid",
      spain: "madrid",
      francia: "paris",
      france: "paris",
      italia: "roma",
      italy: "rome",
      alemania: "berlin",
      germany: "berlin",
      "reino unido": "london",
      "united kingdom": "london",
      "estados unidos": "new york",
      "united states": "new york",
      usa: "new york",
      japon: "tokyo",
      japan: "tokyo",
      china: "beijing",
      india: "mumbai",
      australia: "sydney",
      rusia: "moscow",
      russia: "moscow",
    };

    // Usar el término normalizado para la detección
    const normalizedBase = normalizedTerm;
    
    // Primero verificar si es una ciudad conocida con landmark icónico
    // Buscar en el baseQuery completo (puede incluir ciudad, país)
    const normalizedFullQuery = normalizedTerm;
    
    // Extraer posibles nombres de ciudades del query
    let foundCityLandmark: string | null = null;
    
    // Primero buscar coincidencias exactas o parciales de ciudades conocidas
    for (const [cityKey, landmark] of Object.entries(cityLandmarksMap)) {
      // Verificar si el query contiene el nombre de la ciudad
      // Usar una búsqueda más flexible que considere espacios y variaciones
      const cityPattern = cityKey.toLowerCase().replace(/\s+/g, '\\s*');
      const regex = new RegExp(cityPattern, 'i');
      
      if (regex.test(normalizedFullQuery)) {
        foundCityLandmark = landmark;
        break;
      }
    }
    
    // Si no encontramos nada, verificar si es solo "Rio" (común para Rio de Janeiro)
    if (!foundCityLandmark && (normalizedFullQuery.includes('rio') && (normalizedFullQuery.includes('brazil') || normalizedFullQuery.includes('brasil')))) {
      foundCityLandmark = cityLandmarksMap["rio de janeiro"];
    }
    
    // Verificar si es Brasil/Brazil directamente (país completo)
    if (!foundCityLandmark && (normalizedBase === 'brasil' || normalizedBase === 'brazil')) {
      // Buscar directamente el Cristo Redentor para Brasil
      foundCityLandmark = "christ the redeemer rio de janeiro";
    }
    
    if (foundCityLandmark) {
      // Si encontramos una ciudad conocida, buscar específicamente su landmark
      query = foundCityLandmark;
    } else if (countryToCityMap[normalizedBase]) {
      // Si es un país conocido, buscar específicamente la ciudad principal con términos de ciudad
      const city = countryToCityMap[normalizedBase];
      // Verificar si la ciudad principal tiene un landmark conocido
      if (cityLandmarksMap[city]) {
        // Usar directamente el landmark para obtener imágenes icónicas
        query = cityLandmarksMap[city];
      } else {
        query = `${city} city skyline`;
      }
    } else {
      // Agregar términos específicos para mejorar la búsqueda
      // Priorizar: city, skyline, landscape, capital, travel
      query = `${baseQuery} city skyline landscape travel`;
    }
    
    // Debug: Log para ver qué query se está usando (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[City Image] Base query: "${baseQuery}", Normalized: "${normalizedBase}", Final query: "${query}"`);
    }

    // Normalizar query base para usar como clave de caché (usar baseQuery para consistencia)
    const normalizedQuery = normalizeQuery(baseQuery);

    // Limpiar caché expirado periódicamente (cada 100 requests aproximadamente)
    if (imageCache.size > 0 && Math.random() < 0.01) {
      cleanExpiredCache();
    }

    // Verificar si existe en caché
    const cached = imageCache.get(normalizedQuery);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        // Retornar desde caché
        return NextResponse.json({
          url: cached.url,
          thumb: cached.thumb,
          small: cached.small,
          cached: true,
        });
      } else {
        // Entrada expirada, eliminarla
        imageCache.delete(normalizedQuery);
      }
    }

    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    // Si hay API key, usar la API oficial de Unsplash
    if (unsplashAccessKey) {
      try {
        // Construir queries de búsqueda según el tipo de destino detectado
        let searchQueries: string[];
        
        if (foundCityLandmark) {
          // Si encontramos un landmark específico, buscar primero el landmark, luego la ciudad
          searchQueries = [
            foundCityLandmark, // Primera opción: landmark específico (ej: "christ the redeemer")
            `${foundCityLandmark} ${normalizedBase}`, // Segunda opción: landmark + ciudad/país
            `${foundCityLandmark} brazil`, // Tercera opción: landmark + país (para Brasil)
            `${normalizedBase} city skyline`, // Cuarta opción: ciudad con skyline
            `${normalizedBase} landscape`, // Quinta opción: paisaje
            baseQuery, // Última opción: término original
          ];
        } else {
          // Búsquedas genéricas para ciudades/países sin landmark conocido
          searchQueries = [
            `${baseQuery} city skyline`, // Primera opción: ciudad con skyline
            `${baseQuery} landscape travel`, // Segunda opción: paisaje de viaje
            `${baseQuery} capital`, // Tercera opción: capital
            baseQuery, // Última opción: término original
          ];
        }

        for (const searchQuery of searchQueries) {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=landscape&order_by=relevance`,
            {
              headers: {
                Authorization: `Client-ID ${unsplashAccessKey}`,
              },
            }
          );

          if (!response.ok) {
            continue; // Intentar siguiente query
          }

          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // Filtrar resultados para preferir imágenes de ciudades/paisajes
            // Buscar imágenes que tengan tags relacionados con ciudades, viajes, paisajes
            const preferredTags = ['city', 'urban', 'skyline', 'landscape', 'travel', 'architecture', 'building', 'capital'];
            
            let bestImage = data.results[0];
            
            // Intentar encontrar una imagen con tags preferidos
            for (const image of data.results) {
              const tags = image.tags?.map((tag: { title: string }) => tag.title.toLowerCase()) || [];
              const hasPreferredTag = preferredTags.some(tag => 
                tags.some((imageTag: string) => imageTag.includes(tag))
              );
              
              if (hasPreferredTag) {
                bestImage = image;
                break;
              }
            }

            const imageData = {
              url: bestImage.urls.regular,
              thumb: bestImage.urls.thumb,
              small: bestImage.urls.small,
              author: bestImage.user.name,
              authorUrl: bestImage.user.links.html,
              downloadLocation: bestImage.links.download_location,
            };

            // Guardar en caché usando el query base original
            imageCache.set(normalizedQuery, {
              url: imageData.url,
              thumb: imageData.thumb,
              small: imageData.small,
              timestamp: Date.now(),
            });

            return NextResponse.json(imageData);
          }
        }
      } catch (error) {
        console.error("Error fetching from Unsplash API:", error);
        // Continuar con el método alternativo si falla
      }
    }

    // Método alternativo: usar Unsplash Source API (gratuita, sin API key)
    // Intentar con diferentes queries para obtener mejores resultados
    let sourceQueries: string[];
    
    if (foundCityLandmark) {
      // Si encontramos un landmark específico, buscar primero el landmark
      sourceQueries = [
        foundCityLandmark, // Primera opción: landmark específico
        `${foundCityLandmark} ${normalizedBase}`, // Segunda opción: landmark + ciudad/país
        `${normalizedBase} city`, // Tercera opción: ciudad
        baseQuery, // Última opción: término original
      ];
    } else {
      // Búsquedas genéricas
      sourceQueries = [
        `${baseQuery} city`, // Primera opción: ciudad
        `${baseQuery} landscape`, // Segunda opción: paisaje
        baseQuery, // Última opción: término original
      ];
    }

    for (const sourceQuery of sourceQueries) {
      try {
        const unsplashSourceUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(sourceQuery)}`;
        
        // Verificar que la imagen existe haciendo una petición HEAD
        const headResponse = await fetch(unsplashSourceUrl, { method: "HEAD" });
        if (headResponse.ok) {
          const imageData = {
            url: unsplashSourceUrl,
            thumb: unsplashSourceUrl.replace("800x600", "400x300"),
            small: unsplashSourceUrl.replace("800x600", "600x450"),
            source: "unsplash-source",
          };

          // Guardar en caché usando el query base original
          imageCache.set(normalizedQuery, {
            url: imageData.url,
            thumb: imageData.thumb,
            small: imageData.small,
            timestamp: Date.now(),
          });

          return NextResponse.json(imageData);
        }
      } catch (error) {
        // Continuar con el siguiente query
        continue;
      }
    }

    // Si todo falla, retornar una imagen placeholder o null
    return NextResponse.json(
      { error: "No se pudo obtener imagen para esta ciudad" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in city-image API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

