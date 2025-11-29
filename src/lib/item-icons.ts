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
 * Usa detección inteligente con múltiples palabras clave y prioridad
 */
export function getItemIcon(itemName: string): LucideIcon {
  const name = itemName.toLowerCase().trim();

  // Dividir en palabras para mejor matching
  const words = name.split(/\s+/);

  // Función helper para verificar si alguna palabra coincide
  const hasWord = (...keywords: string[]) => {
    return keywords.some(
      (keyword) =>
        words.some((word) => word === keyword || word.includes(keyword)) ||
        name.includes(keyword)
    );
  };

  // Ropa y accesorios de vestir
  if (
    hasWord(
      "zapato",
      "shoe",
      "zapatilla",
      "sneaker",
      "botas",
      "boots",
      "sandalia",
      "sandal",
      "tenis",
      "tennis"
    )
  ) {
    return Footprints;
  }
  if (
    hasWord(
      "ropa",
      "shirt",
      "vestido",
      "dress",
      "pantalon",
      "pants",
      "jeans",
      "camisa",
      "blusa",
      "blouse",
      "chaqueta",
      "jacket",
      "abrigo",
      "coat",
      "pulover",
      "pullover",
      "camiseta",
      "tshirt",
      "t-shirt",
      "gorra",
      "cap",
      "sueter",
      "sweater",
      "sudader",
      "hoodie",
      "bufanda",
      "scarf",
      "guantes",
      "gloves",
      "calcetines",
      "socks",
      "medias",
      "pantalones",
      "shorts",
      "bermudas",
      "falda",
      "skirt",
      "top",
      "blazer",
      "cardigan",
      "chaleco",
      "vest",
      "pijama",
      "pajamas",
      "bata",
      "robe"
    )
  ) {
    return Shirt;
  }
  if (hasWord("reloj", "watch", "smartwatch")) {
    return Watch;
  }
  if (hasWord("gafas", "sunglasses", "lentes", "glasses", "anteojos")) {
    return Glasses;
  }

  // Electrónicos y tecnología
  if (
    hasWord(
      "telefono",
      "phone",
      "smartphone",
      "celular",
      "mobile",
      "iphone",
      "android"
    )
  ) {
    return Smartphone;
  }
  if (
    hasWord("laptop", "notebook", "computadora", "computer", "macbook", "pc")
  ) {
    return Laptop;
  }
  if (
    hasWord("auriculares", "headphones", "audifonos", "earphones", "airpods")
  ) {
    return Headphones;
  }
  if (
    hasWord(
      "camara",
      "camera",
      "foto",
      "photo",
      "fotografia",
      "photography",
      "canon",
      "nikon",
      "sony"
    )
  ) {
    return Camera;
  }
  if (
    hasWord(
      "cargador",
      "charger",
      "cable",
      "cable",
      "usb",
      "powerbank",
      "bateria",
      "battery"
    )
  ) {
    return Battery;
  }
  if (hasWord("tablet", "ipad", "kindle", "ereader")) {
    return Laptop; // Usar laptop como icono genérico para tablets
  }

  // Comida y bebidas
  if (
    hasWord(
      "comida",
      "food",
      "restaurant",
      "cena",
      "dinner",
      "almuerzo",
      "lunch",
      "desayuno",
      "breakfast",
      "comer",
      "eat"
    )
  ) {
    return UtensilsCrossed;
  }
  if (
    hasWord(
      "cafe",
      "coffee",
      "bebida",
      "drink",
      "refresco",
      "soda",
      "agua",
      "water",
      "jugo",
      "juice"
    )
  ) {
    return Coffee;
  }

  // Salud y medicina
  if (
    hasWord(
      "medicina",
      "medicine",
      "medicamento",
      "medication",
      "pastilla",
      "pill",
      "tableta",
      "tablet",
      "vitamina",
      "vitamin"
    )
  ) {
    return Pill;
  }
  if (
    hasWord(
      "botiquin",
      "firstaid",
      "first-aid",
      "curitas",
      "bandaid",
      "vendas",
      "bandages"
    )
  ) {
    return Stethoscope;
  }

  // Viajes y equipaje
  if (
    hasWord(
      "maleta",
      "suitcase",
      "equipaje",
      "luggage",
      "valija",
      "mochila",
      "backpack",
      "bolso",
      "bag"
    )
  ) {
    return Package;
  }
  if (hasWord("paquete", "package", "caja", "box")) {
    return Package;
  }
  if (hasWord("avion", "plane", "vuelo", "flight", "aeropuerto", "airport")) {
    return Plane;
  }
  if (hasWord("carro", "car", "auto", "vehiculo", "vehicle", "taxi", "uber")) {
    return Car;
  }
  if (hasWord("mapa", "map", "guia", "guide", "direcciones", "directions")) {
    return Map;
  }
  if (hasWord("brújula", "compass", "navegacion", "navigation")) {
    return Compass;
  }
  if (hasWord("llave", "key", "llaves", "keys")) {
    return Key;
  }

  // Actividades y entretenimiento
  if (hasWord("libro", "book", "lectura", "reading", "novela", "novel")) {
    return Book;
  }
  if (
    hasWord(
      "juego",
      "game",
      "videojuego",
      "videogame",
      "playstation",
      "xbox",
      "nintendo",
      "switch"
    )
  ) {
    return Gamepad2;
  }
  if (hasWord("nadar", "swim", "traje", "bañador", "swimsuit", "bikini")) {
    return Waves;
  }
  if (hasWord("camping", "tienda", "tent", "carpa", "saco", "sleeping")) {
    return Tent;
  }

  // Accesorios y objetos personales
  if (
    hasWord(
      "billetera",
      "wallet",
      "cartera",
      "dinero",
      "money",
      "efectivo",
      "cash"
    )
  ) {
    return Wallet;
  }
  if (hasWord("tarjeta", "card", "credito", "credit", "debito", "debit")) {
    return CreditCard;
  }
  if (hasWord("paraguas", "umbrella", "sombrilla")) {
    return Umbrella;
  }
  if (
    hasWord(
      "protector",
      "sunscreen",
      "bronceador",
      "suntan",
      "sol",
      "sun",
      "crema",
      "lotion"
    )
  ) {
    return Sun;
  }
  if (hasWord("toalla", "towel", "playa", "beach", "arena", "sand")) {
    return Waves;
  }
  if (
    hasWord(
      "montaña",
      "mountain",
      "hiking",
      "senderismo",
      "trekking",
      "escalada",
      "climbing"
    )
  ) {
    return Mountain;
  }
  if (
    hasWord("regalo", "gift", "souvenir", "recuerdo", "presente", "present")
  ) {
    return Gift;
  }
  if (hasWord("candado", "lock", "seguridad", "security")) {
    return Lock;
  }
  if (hasWord("tijeras", "scissors", "cortar", "cut")) {
    return Scissors;
  }
  if (hasWord("maletin", "briefcase", "portafolio", "portfolio")) {
    return Briefcase;
  }
  if (
    hasWord("agua", "water", "botella", "bottle", "hidratacion", "hydration")
  ) {
    return Droplet;
  }
  if (
    hasWord(
      "energia",
      "energy",
      "carga",
      "charge",
      "electricidad",
      "electricity"
    )
  ) {
    return Zap;
  }

  // Documentos y papeles
  if (
    hasWord(
      "pasaporte",
      "passport",
      "visa",
      "documento",
      "document",
      "identificacion",
      "id",
      "licencia",
      "license",
      "certificado",
      "certificate"
    )
  ) {
    return FileText;
  }

  // Higiene personal
  if (
    hasWord(
      "cepillo",
      "brush",
      "dientes",
      "teeth",
      "toothbrush",
      "pasta",
      "toothpaste",
      "dental"
    )
  ) {
    return Sparkles;
  }
  if (
    hasWord(
      "champu",
      "shampoo",
      "jabon",
      "soap",
      "desodorante",
      "deodorant",
      "crema",
      "cream",
      "lotion",
      "gel",
      "higiene",
      "hygiene"
    )
  ) {
    return Droplet;
  }

  // Maquillaje y cosméticos
  if (
    hasWord(
      "maquillaje",
      "makeup",
      "labial",
      "lipstick",
      "base",
      "foundation",
      "sombra",
      "eyeshadow",
      "rimel",
      "mascara",
      "polvo",
      "powder",
      "cosmetico",
      "cosmetic"
    )
  ) {
    return Sparkles;
  }

  // Joyería
  if (
    hasWord(
      "joya",
      "jewelry",
      "anillo",
      "ring",
      "collar",
      "necklace",
      "pulsera",
      "bracelet",
      "aretes",
      "earrings",
      "pendientes",
      "reloj",
      "watch"
    )
  ) {
    return Heart;
  }

  // Deportes y fitness
  if (
    hasWord(
      "deporte",
      "sport",
      "fitness",
      "gym",
      "pelota",
      "ball",
      "raqueta",
      "racket",
      "pesas",
      "weights",
      "ejercicio",
      "exercise"
    )
  ) {
    return Dumbbell;
  }

  // Instrumentos musicales
  if (
    hasWord(
      "musica",
      "music",
      "guitarra",
      "guitar",
      "piano",
      "violin",
      "flauta",
      "flute",
      "instrumento",
      "instrument"
    )
  ) {
    return Music;
  }

  // Herramientas
  if (
    hasWord(
      "herramienta",
      "tool",
      "martillo",
      "hammer",
      "destornillador",
      "screwdriver",
      "llave",
      "wrench",
      "alicate",
      "pliers"
    )
  ) {
    return Wrench;
  }

  // Productos para bebés
  if (
    hasWord(
      "bebe",
      "baby",
      "nino",
      "child",
      "pañal",
      "diaper",
      "biberon",
      "bottle",
      "chupete",
      "pacifier"
    )
  ) {
    return Baby;
  }

  // Mascotas
  if (
    hasWord(
      "mascota",
      "pet",
      "perro",
      "dog",
      "gato",
      "cat",
      "comida",
      "food",
      "juguete",
      "toy"
    )
  ) {
    return Heart;
  }

  // Snacks y alimentos específicos
  if (
    hasWord(
      "snack",
      "chips",
      "papas",
      "galleta",
      "cookie",
      "dulce",
      "candy",
      "chocolate",
      "fruta",
      "fruit",
      "verdura",
      "vegetable"
    )
  ) {
    return Cookie;
  }

  // Bebidas alcohólicas
  if (
    hasWord(
      "vino",
      "wine",
      "cerveza",
      "beer",
      "licor",
      "liquor",
      "whisky",
      "whiskey",
      "ron",
      "rum",
      "tequila",
      "alcohol"
    )
  ) {
    return Wine;
  }

  // Productos de oficina
  if (
    hasWord(
      "pluma",
      "pen",
      "lapiz",
      "pencil",
      "papel",
      "paper",
      "cuaderno",
      "notebook",
      "carpeta",
      "folder",
      "oficina",
      "office"
    )
  ) {
    return PenTool;
  }

  // Linterna y productos de emergencia
  if (
    hasWord(
      "linterna",
      "flashlight",
      "antorcha",
      "torch",
      "luz",
      "light",
      "emergencia",
      "emergency"
    )
  ) {
    return Flashlight;
  }

  // Saco de dormir y productos de camping
  if (
    hasWord(
      "saco",
      "sleeping",
      "bag",
      "saco",
      "sleeping",
      "bolsa",
      "dormir",
      "sleep"
    )
  ) {
    return Moon;
  }

  // Productos de invierno
  if (
    hasWord(
      "bufanda",
      "scarf",
      "guantes",
      "gloves",
      "gorro",
      "hat",
      "cap",
      "invierno",
      "winter",
      "frio",
      "cold"
    )
  ) {
    return Snowflake;
  }

  // Por defecto, usar ShoppingBag
  return ShoppingBag;
}
