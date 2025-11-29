import {
  ShoppingBag,
  Shirt,
  UtensilsCrossed,
  Coffee,
  Camera,
  Book,
  Gamepad2,
  Heart,
  Gift,
  Sun,
  Waves,
  Mountain,
  Car,
  Plane,
  Package,
  ShoppingCart,
  Shoe,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  CreditCard,
  Wallet,
  Pill,
  Stethoscope,
  Umbrella,
  Sunglasses,
  Swimmer,
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
  Luggage,
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
    return keywords.some(keyword => 
      words.some(word => word === keyword || word.includes(keyword)) ||
      name.includes(keyword)
    );
  };

  // Ropa y accesorios de vestir
  if (hasWord("zapato", "shoe", "zapatilla", "sneaker", "botas", "boots", "sandalia", "sandal", "tenis", "tennis")) {
    return Shoe;
  }
  if (hasWord("ropa", "shirt", "vestido", "dress", "pantalon", "pants", "jeans", "camisa", "blusa", "blouse", "chaqueta", "jacket", "abrigo", "coat")) {
    return Shirt;
  }
  if (hasWord("reloj", "watch", "smartwatch")) {
    return Watch;
  }
  if (hasWord("gafas", "sunglasses", "lentes", "glasses", "anteojos")) {
    return Sunglasses;
  }

  // Electrónicos y tecnología
  if (hasWord("telefono", "phone", "smartphone", "celular", "mobile", "iphone", "android")) {
    return Smartphone;
  }
  if (hasWord("laptop", "notebook", "computadora", "computer", "macbook", "pc")) {
    return Laptop;
  }
  if (hasWord("auriculares", "headphones", "audifonos", "earphones", "airpods")) {
    return Headphones;
  }
  if (hasWord("camara", "camera", "foto", "photo", "fotografia", "photography", "canon", "nikon", "sony")) {
    return Camera;
  }
  if (hasWord("cargador", "charger", "cable", "cable", "usb", "powerbank", "bateria", "battery")) {
    return Battery;
  }
  if (hasWord("tablet", "ipad", "kindle", "ereader")) {
    return Laptop; // Usar laptop como icono genérico para tablets
  }

  // Comida y bebidas
  if (hasWord("comida", "food", "restaurant", "cena", "dinner", "almuerzo", "lunch", "desayuno", "breakfast", "comer", "eat")) {
    return UtensilsCrossed;
  }
  if (hasWord("cafe", "coffee", "bebida", "drink", "refresco", "soda", "agua", "water", "jugo", "juice")) {
    return Coffee;
  }

  // Salud y medicina
  if (hasWord("medicina", "medicine", "medicamento", "medication", "pastilla", "pill", "tableta", "tablet", "vitamina", "vitamin")) {
    return Pill;
  }
  if (hasWord("botiquin", "firstaid", "first-aid", "curitas", "bandaid", "vendas", "bandages")) {
    return Stethoscope;
  }

  // Viajes y equipaje
  if (hasWord("maleta", "suitcase", "equipaje", "luggage", "valija", "mochila", "backpack", "bolso", "bag")) {
    return Luggage;
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
  if (hasWord("juego", "game", "videojuego", "videogame", "playstation", "xbox", "nintendo", "switch")) {
    return Gamepad2;
  }
  if (hasWord("nadar", "swim", "traje", "bañador", "swimsuit", "bikini")) {
    return Swimmer;
  }
  if (hasWord("camping", "tienda", "tent", "carpa", "saco", "sleeping")) {
    return Tent;
  }

  // Accesorios y objetos personales
  if (hasWord("billetera", "wallet", "cartera", "dinero", "money", "efectivo", "cash")) {
    return Wallet;
  }
  if (hasWord("tarjeta", "card", "credito", "credit", "debito", "debit")) {
    return CreditCard;
  }
  if (hasWord("paraguas", "umbrella", "sombrilla")) {
    return Umbrella;
  }
  if (hasWord("protector", "sunscreen", "bronceador", "suntan", "sol", "sun", "crema", "lotion")) {
    return Sun;
  }
  if (hasWord("toalla", "towel", "playa", "beach", "arena", "sand")) {
    return Waves;
  }
  if (hasWord("montaña", "mountain", "hiking", "senderismo", "trekking", "escalada", "climbing")) {
    return Mountain;
  }
  if (hasWord("regalo", "gift", "souvenir", "recuerdo", "presente", "present")) {
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
  if (hasWord("agua", "water", "botella", "bottle", "hidratacion", "hydration")) {
    return Droplet;
  }
  if (hasWord("energia", "energy", "carga", "charge", "electricidad", "electricity")) {
    return Zap;
  }

  // Por defecto, usar ShoppingBag
  return ShoppingBag;
}
