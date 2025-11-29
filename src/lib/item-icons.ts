import {
  ShoppingBag,
  Shirt,
  UtensilsCrossed,
  Coffee,
  Camera,
  Book,
  Gamepad2,
  Gift,
  Sun,
  Waves,
  Mountain,
  Car,
  Plane,
  Package,
  Footprints,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  CreditCard,
  Wallet,
  Pill,
  Stethoscope,
  Umbrella,
  Glasses,
  Tent,
  Compass,
  Map,
  Key,
  Lock,
  Battery,
  Zap,
  Droplet,
  Scissors,
  Briefcase,
  FileText,
  Sparkles,
  Dumbbell,
  Music,
  Wrench,
  Baby,
  Heart,
  Cookie,
  Wine,
  PenTool,
  Flashlight,
  Moon,
  Snowflake,
  type LucideIcon,
} from "lucide-react";

/**
 * Determina el icono apropiado para un item basado en su nombre
 * Usa detección inteligente con matching exacto y parcial, priorizando especificidad
 */
export function getItemIcon(itemName: string): LucideIcon {
  const name = itemName.toLowerCase().trim();
  
  // Dividir en palabras para mejor matching
  const words = name.split(/\s+/);
  
  // Función helper para verificar coincidencia exacta de palabra
  const hasExactWord = (...keywords: string[]) => {
    return keywords.some(keyword => words.includes(keyword));
  };
  
  // Función helper para verificar coincidencia parcial (más específica primero)
  const hasPartialWord = (...keywords: string[]) => {
    return keywords.some(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word)) ||
      name.includes(keyword)
    );
  };

  // ===== CATEGORÍAS ESPECÍFICAS (ordenadas por especificidad) =====

  // Documentos y papeles (muy específico)
  if (
    hasExactWord("pasaporte", "passport", "visa", "documento", "document", "identificacion", "id", "licencia", "license") ||
    hasPartialWord("certificado", "certificate")
  ) {
    return FileText;
  }

  // Cepillo de dientes (específico)
  if (
    hasExactWord("cepillo", "brush") && 
    (hasPartialWord("diente", "teeth", "dental") || hasExactWord("toothbrush"))
  ) {
    return Sparkles;
  }

  // Maquillaje (específico)
  if (
    hasExactWord("maquillaje", "makeup", "labial", "lipstick", "base", "foundation", "sombra", "eyeshadow", "rimel", "mascara", "polvo", "powder", "cosmetico", "cosmetic")
  ) {
    return Sparkles;
  }

  // Joyería (específico)
  if (
    hasExactWord("joya", "jewelry", "anillo", "ring", "collar", "necklace", "pulsera", "bracelet", "aretes", "earrings", "pendientes")
  ) {
    return Heart;
  }

  // Instrumentos musicales (específico)
  if (
    hasExactWord("musica", "music", "guitarra", "guitar", "piano", "violin", "flauta", "flute", "instrumento", "instrument")
  ) {
    return Music;
  }

  // Herramientas (específico)
  if (
    hasExactWord("herramienta", "tool", "martillo", "hammer", "destornillador", "screwdriver", "alicate", "pliers")
  ) {
    return Wrench;
  }

  // Productos para bebés (específico)
  if (
    hasExactWord("bebe", "baby", "nino", "child", "pañal", "diaper", "biberon", "bottle", "chupete", "pacifier")
  ) {
    return Baby;
  }

  // Mascotas (específico)
  if (
    hasExactWord("mascota", "pet", "perro", "dog", "gato", "cat") &&
    (hasPartialWord("comida", "food", "juguete", "toy") || name.includes("mascota") || name.includes("pet"))
  ) {
    return Heart;
  }

  // Snacks (específico)
  if (
    hasExactWord("snack", "chips", "papas", "galleta", "cookie", "dulce", "candy", "chocolate")
  ) {
    return Cookie;
  }

  // Bebidas alcohólicas (específico - antes de bebidas genéricas)
  if (
    hasExactWord("vino", "wine", "cerveza", "beer", "licor", "liquor", "whisky", "whiskey", "ron", "rum", "tequila", "alcohol")
  ) {
    return Wine;
  }

  // Productos de oficina (específico)
  if (
    hasExactWord("pluma", "pen", "lapiz", "pencil", "papel", "paper", "cuaderno", "notebook", "carpeta", "folder", "oficina", "office")
  ) {
    return PenTool;
  }

  // Linterna (específico)
  if (
    hasExactWord("linterna", "flashlight", "antorcha", "torch") ||
    (hasExactWord("luz", "light") && hasPartialWord("emergencia", "emergency"))
  ) {
    return Flashlight;
  }

  // Saco de dormir (específico)
  if (
    hasExactWord("saco") && hasPartialWord("dormir", "sleeping") ||
    hasExactWord("sleeping", "bag")
  ) {
    return Moon;
  }

  // Productos de invierno (específico - antes de ropa genérica)
  if (
    hasExactWord("bufanda", "scarf", "guantes", "gloves", "gorro", "invierno", "winter") ||
    (hasExactWord("hat", "cap") && hasPartialWord("invierno", "winter", "frio", "cold"))
  ) {
    return Snowflake;
  }

  // Calzado (específico - antes de ropa)
  if (
    hasExactWord("zapato", "shoe", "zapatilla", "sneaker", "botas", "boots", "sandalia", "sandal", "tenis", "tennis", "zapatos", "shoes")
  ) {
    return Footprints;
  }

  // Ropa (categoría amplia pero después de específicos)
  if (
    hasExactWord("ropa", "shirt", "vestido", "dress", "pantalon", "pants", "jean", "jeans", "camisa", "blusa", "blouse", 
      "chaqueta", "jacket", "abrigo", "coat", "pulover", "pullover", "camiseta", "tshirt", "t-shirt", "sueter", "sweater",
      "sudader", "hoodie", "calcetines", "socks", "medias", "pantalones", "shorts", "bermudas", "falda", "skirt",
      "top", "blazer", "cardigan", "chaleco", "vest", "pijama", "pajamas", "bata", "robe")
  ) {
    return Shirt;
  }

  // Reloj (específico)
  if (hasExactWord("reloj", "watch", "smartwatch")) {
    return Watch;
  }

  // Gafas (específico)
  if (hasExactWord("gafas", "sunglasses", "lentes", "glasses", "anteojos")) {
    return Glasses;
  }

  // Electrónicos y tecnología
  if (
    hasExactWord("telefono", "phone", "smartphone", "celular", "mobile", "iphone", "android")
  ) {
    return Smartphone;
  }
  if (
    hasExactWord("laptop", "notebook", "computadora", "computer", "macbook", "pc")
  ) {
    return Laptop;
  }
  if (
    hasExactWord("auriculares", "headphones", "audifonos", "earphones", "airpods")
  ) {
    return Headphones;
  }
  if (
    hasExactWord("camara", "camera", "foto", "photo", "fotografia", "photography", "canon", "nikon", "sony")
  ) {
    return Camera;
  }
  if (
    hasExactWord("cargador", "charger", "cable", "usb", "powerbank", "bateria", "battery")
  ) {
    return Battery;
  }
  if (hasExactWord("tablet", "ipad", "kindle", "ereader")) {
    return Laptop;
  }

  // Comida (genérico - después de snacks y bebidas específicas)
  if (
    hasExactWord("comida", "food", "restaurant", "cena", "dinner", "almuerzo", "lunch", "desayuno", "breakfast", "comer", "eat")
  ) {
    return UtensilsCrossed;
  }

  // Bebidas (genérico - después de alcohólicas)
  if (
    hasExactWord("cafe", "coffee", "bebida", "drink", "refresco", "soda", "jugo", "juice") ||
    (hasExactWord("agua", "water") && !hasPartialWord("pistola", "gun", "spray", "botella", "bottle"))
  ) {
    return Coffee;
  }

  // Salud y medicina
  if (
    hasExactWord("medicina", "medicine", "medicamento", "medication", "pastilla", "pill", "tableta", "tablet", "vitamina", "vitamin")
  ) {
    return Pill;
  }
  if (
    hasExactWord("botiquin", "firstaid", "first-aid", "curitas", "bandaid", "vendas", "bandages")
  ) {
    return Stethoscope;
  }

  // Viajes y equipaje
  if (
    hasExactWord("maleta", "suitcase", "equipaje", "luggage", "valija", "mochila", "backpack", "bolso", "bag")
  ) {
    return Package;
  }
  if (hasExactWord("paquete", "package", "caja", "box")) {
    return Package;
  }
  if (hasExactWord("avion", "plane", "vuelo", "flight", "aeropuerto", "airport")) {
    return Plane;
  }
  if (hasExactWord("carro", "car", "auto", "vehiculo", "vehicle", "taxi", "uber")) {
    return Car;
  }
  if (hasExactWord("mapa", "map", "guia", "guide", "direcciones", "directions")) {
    return Map;
  }
  if (hasExactWord("brújula", "compass", "navegacion", "navigation")) {
    return Compass;
  }
  if (hasExactWord("llave", "key", "llaves", "keys")) {
    return Key;
  }

  // Actividades y entretenimiento
  if (hasExactWord("libro", "book", "lectura", "reading", "novela", "novel")) {
    return Book;
  }
  if (
    hasExactWord("juego", "game", "videojuego", "videogame", "playstation", "xbox", "nintendo", "switch")
  ) {
    return Gamepad2;
  }
  if (hasExactWord("nadar", "swim", "traje", "bañador", "swimsuit", "bikini")) {
    return Waves;
  }
  if (hasExactWord("camping", "tienda", "tent", "carpa", "saco", "sleeping")) {
    return Tent;
  }

  // Deportes y fitness
  if (
    hasExactWord("deporte", "sport", "fitness", "gym", "pelota", "ball", "raqueta", "racket", "pesas", "weights", "ejercicio", "exercise")
  ) {
    return Dumbbell;
  }

  // Accesorios y objetos personales
  if (
    hasExactWord("billetera", "wallet", "cartera", "dinero", "money", "efectivo", "cash")
  ) {
    return Wallet;
  }
  if (hasExactWord("tarjeta", "card", "credito", "credit", "debito", "debit")) {
    return CreditCard;
  }
  if (hasExactWord("paraguas", "umbrella", "sombrilla")) {
    return Umbrella;
  }
  if (
    hasExactWord("protector", "sunscreen", "bronceador", "suntan", "sol", "sun", "crema", "lotion")
  ) {
    return Sun;
  }
  if (hasExactWord("toalla", "towel", "playa", "beach", "arena", "sand")) {
    return Waves;
  }
  if (
    hasExactWord("montaña", "mountain", "hiking", "senderismo", "trekking", "escalada", "climbing")
  ) {
    return Mountain;
  }
  if (
    hasExactWord("regalo", "gift", "souvenir", "recuerdo", "presente", "present")
  ) {
    return Gift;
  }
  if (hasExactWord("candado", "lock", "seguridad", "security")) {
    return Lock;
  }
  if (hasExactWord("tijeras", "scissors", "cortar", "cut")) {
    return Scissors;
  }
  if (hasExactWord("maletin", "briefcase", "portafolio", "portfolio")) {
    return Briefcase;
  }
  if (
    hasExactWord("agua", "water", "botella", "bottle", "hidratacion", "hydration")
  ) {
    return Droplet;
  }
  if (
    hasExactWord("energia", "energy", "carga", "charge", "electricidad", "electricity")
  ) {
    return Zap;
  }

  // Por defecto, usar ShoppingBag
  return ShoppingBag;
}
