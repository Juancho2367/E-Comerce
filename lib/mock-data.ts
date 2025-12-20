export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  price: number
  originalPrice?: number
  images: string[]
  badge?: "Nuevo" | "Edición Limitada"
  description: string
  sizes: string[]
  colors: string[]
}

export interface Category {
  id: string
  name: string
  subcategories: string[]
}

export const categories: Category[] = [
  {
    id: "mujer",
    name: "Mujer",
    subcategories: ["Jeans", "Tops", "Tops Deportivos", "Leggings", "Shorts", "Conjuntos", "Chaquetas", "Calzado", "Accesorios Gym"],
  },
  {
    id: "gym",
    name: "Gym",
    subcategories: ["Leggings", "Tops Deportivos", "Shorts", "Conjuntos", "Calzado", "Accesorios Gym"],
  },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Jean Clásico Azul",
    category: "mujer",
    subcategory: "Jeans",
    price: 1299,
    images: ["/images/products/jean-clasico-azul/principal.jpg"],
    badge: "Nuevo",
    description: "Jean clásico de corte recto en color azul. Perfecto para cualquier ocasión.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul", "Negro", "Gris"],
  },
  {
    id: "2",
    name: "Jean Denim Premium",
    category: "mujer",
    subcategory: "Jeans",
    price: 1499,
    images: ["/images/products/jean-denim-premium/principal.jpg"],
    badge: "Edición Limitada",
    description: "Jean premium de alta calidad con ajuste perfecto.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul", "Negro"],
  },
  {
    id: "3",
    name: "Jean Wide Leg Marrón",
    category: "mujer",
    subcategory: "Jeans",
    price: 1399,
    images: ["https://static.zara.net/assets/public/f2e1/8460/129548f1ac25/64b81bb79409/08246246717-a3/08246246717-a3.jpg?ts=1766049007531&w=974"],
    description: "Jean de corte wide leg en color marrón oscuro con cintura alta. Perfecto para looks modernos y cómodos.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Marrón", "Negro", "Gris"],
  },
  {
    id: "4",
    name: "Jean Recto Claro",
    category: "mujer",
    subcategory: "Jeans",
    price: 1199,
    images: ["/images/products/jean-recto-claro/principal.jpg"],
    badge: "Nuevo",
    description: "Jean de corte recto en tonalidad clara perfecta para primavera.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul Claro", "Blanco"],
  },
  {
    id: "5",
    name: "Jean Wide Leg Azul Claro",
    category: "mujer",
    subcategory: "Jeans",
    price: 899,
    images: ["https://static.bershka.net/assets/public/c6fe/86b5/c14244c88503/7d79320e7bd3/00018335400-28-p/00018335400-28-p.jpg?ts=1763550134582&w=850"],
    badge: "Edición Limitada",
    description: "Jean de corte wide leg en color azul claro con estilo relajado. Ideal para looks casuales y modernos.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul Claro", "Negro", "Gris"],
  },
  {
    id: "6",
    name: "Top Crop Negro",
    category: "gym",
    subcategory: "Tops Deportivos",
    price: 699,
    images: ["https://static.bershka.net/assets/public/467c/df36/44f5446ab599/66d2a852a742/00019180428-a2d/00019180428-a2d.jpg?ts=1762167192587&w=850"],
    badge: "Nuevo",
    description: "Top crop de manga larga en color negro con textura acanalada. Perfecto para looks casuales y modernos.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Blanco", "Rosa"],
  },
  {
    id: "7",
    name: "Top Halter con Lentejuelas",
    category: "mujer",
    subcategory: "Tops",
    price: 1599,
    images: ["https://static.bershka.net/assets/public/6069/9f40/338b48deb4ca/17a15b51e4b0/00050662700-p/00050662700-p.jpg?ts=1762423745736&w=850"],
    description: "Top halter con lentejuelas en tono bronce/dorado. Diseño elegante con escote en V y estilo asimétrico.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Bronce", "Negro", "Dorado"],
  },
  {
    id: "8",
    name: "Conjunto Deportivo Mint",
    category: "gym",
    subcategory: "Conjuntos",
    price: 1399,
    images: ["https://static.bershka.net/assets/public/c05f/1ba2/add24921a2e4/c517e5caf830/07004478812BSBS-p/07004478812BSBS-p.jpg?ts=1753362836822&w=850"],
    badge: "Edición Limitada",
    description: "Conjunto deportivo completo con top y legging a juego.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Mint", "Negro", "Rosa"],
  },
]

export interface CartItem {
  product: Product
  quantity: number
  size: string
  color: string
}
