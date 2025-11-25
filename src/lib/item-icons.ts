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
  type LucideIcon,
} from "lucide-react";

/**
 * Determina el icono apropiado para un item basado en su nombre
 */
export function getItemIcon(itemName: string): LucideIcon {
  const name = itemName.toLowerCase();

  // Categorías de items comunes
  if (name.includes("ropa") || name.includes("shirt") || name.includes("vestido") || name.includes("pantalon")) {
    return Shirt;
  }
  if (name.includes("comida") || name.includes("food") || name.includes("restaurant") || name.includes("cena") || name.includes("almuerzo")) {
    return UtensilsCrossed;
  }
  if (name.includes("cafe") || name.includes("coffee") || name.includes("bebida") || name.includes("drink")) {
    return Coffee;
  }
  if (name.includes("camara") || name.includes("camera") || name.includes("foto") || name.includes("photo")) {
    return Camera;
  }
  if (name.includes("libro") || name.includes("book") || name.includes("lectura")) {
    return Book;
  }
  if (name.includes("juego") || name.includes("game") || name.includes("video")) {
    return Gamepad2;
  }
  if (name.includes("regalo") || name.includes("gift") || name.includes("souvenir")) {
    return Gift;
  }
  if (name.includes("sol") || name.includes("sun") || name.includes("protector") || name.includes("sunscreen")) {
    return Sun;
  }
  if (name.includes("playa") || name.includes("beach") || name.includes("toalla") || name.includes("towel")) {
    return Waves;
  }
  if (name.includes("montaña") || name.includes("mountain") || name.includes("hiking") || name.includes("senderismo")) {
    return Mountain;
  }
  if (name.includes("carro") || name.includes("car") || name.includes("auto") || name.includes("vehiculo")) {
    return Car;
  }
  if (name.includes("avion") || name.includes("plane") || name.includes("vuelo") || name.includes("flight")) {
    return Plane;
  }
  if (name.includes("paquete") || name.includes("package") || name.includes("maleta") || name.includes("suitcase")) {
    return Package;
  }

  // Por defecto, usar ShoppingBag o ShoppingCart
  return ShoppingBag;
}





