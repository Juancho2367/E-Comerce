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
    subcategories: ["Leggings", "Tops Deportivos", "Shorts", "Conjuntos", "Calzado", "Accesorios Gym"],
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
    name: "Jean Skinny Azul",
    category: "mujer",
    subcategory: "Jeans",
    price: 1399,
    images: ["/placeholder.svg?height=600&width=400"],
    description: "Jean skinny ajustado que realza tu figura.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Azul", "Negro", "Gris"],
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
    name: "Legging Deportivo Mint",
    category: "gym",
    subcategory: "Leggings",
    price: 899,
    images: ["/placeholder.svg?height=600&width=400"],
    badge: "Edición Limitada",
    description: "Legging de alto rendimiento con tecnología anti-sudor.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Mint", "Negro", "Gris"],
  },
  {
    id: "6",
    name: "Top Deportivo Negro",
    category: "gym",
    subcategory: "Tops Deportivos",
    price: 699,
    images: ["/placeholder.svg?height=600&width=400"],
    badge: "Nuevo",
    description: "Top deportivo con soporte medio ideal para yoga y running.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Blanco", "Rosa"],
  },
  {
    id: "7",
    name: "Chaqueta Denim Turquesa",
    category: "mujer",
    subcategory: "Chaquetas",
    price: 1599,
    images: ["/placeholder.svg?height=600&width=400"],
    description: "Chaqueta denim en color turquesa, perfecta para looks casuales.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Turquesa", "Azul", "Negro"],
  },
  {
    id: "8",
    name: "Conjunto Deportivo Mint",
    category: "gym",
    subcategory: "Conjuntos",
    price: 1399,
    images: ["/placeholder.svg?height=600&width=400"],
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
