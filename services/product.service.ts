import { Product, Category, products, categories } from "@/lib/mock-data"

// Simulating an API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const productService = {
  async getProducts(): Promise<Product[]> {
    await delay(500)
    return products
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await delay(300)
    return products.find((p) => p.id === id)
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await delay(500)
    return products.slice(0, 8)
  },

  async getCategories(): Promise<Category[]> {
    await delay(300)
    return categories
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    await delay(500)
    return products.filter((p) => p.category === categoryId)
  }
}

