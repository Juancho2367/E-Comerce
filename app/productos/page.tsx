"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react"
import { productService } from "@/services/product.service"
import type { Product, Category } from "@/lib/mock-data"

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false
    if (selectedSubcategory !== "all" && product.subcategory !== selectedSubcategory) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price
    if (sortBy === "price-desc") return b.price - a.price
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-2">Productos</h1>
          <p className="text-muted-foreground">
            Mostrando {sortedProducts.length} {sortedProducts.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4">Filtros</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Categoría</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="cat-all"
                      checked={selectedCategory === "all"}
                      onCheckedChange={() => {
                        setSelectedCategory("all")
                        setSelectedSubcategory("all")
                      }}
                    />
                    <Label htmlFor="cat-all" className="ml-2 text-sm cursor-pointer">
                      Todos
                    </Label>
                  </div>
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategory === cat.id}
                        onCheckedChange={() => {
                          setSelectedCategory(cat.id)
                          setSelectedSubcategory("all")
                        }}
                      />
                      <Label htmlFor={`cat-${cat.id}`} className="ml-2 text-sm cursor-pointer capitalize">
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              {selectedCategory !== "all" && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Subcategoría</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="sub-all"
                        checked={selectedSubcategory === "all"}
                        onCheckedChange={() => setSelectedSubcategory("all")}
                      />
                      <Label htmlFor="sub-all" className="ml-2 text-sm cursor-pointer">
                        Todas
                      </Label>
                    </div>
                    {categories
                      .find((cat) => cat.id === selectedCategory)
                      ?.subcategories.map((sub) => (
                        <div key={sub} className="flex items-center">
                          <Checkbox
                            id={`sub-${sub}`}
                            checked={selectedSubcategory === sub}
                            onCheckedChange={() => setSelectedSubcategory(sub)}
                          />
                          <Label htmlFor={`sub-${sub}`} className="ml-2 text-sm cursor-pointer">
                            {sub}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedSubcategory("all")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden bg-transparent">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {/* Category Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3">Categoría</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="mob-cat-all"
                            checked={selectedCategory === "all"}
                            onCheckedChange={() => {
                              setSelectedCategory("all")
                              setSelectedSubcategory("all")
                            }}
                          />
                          <Label htmlFor="mob-cat-all" className="ml-2 text-sm cursor-pointer">
                            Todos
                          </Label>
                        </div>
                        {categories.map((cat) => (
                          <div key={cat.id} className="flex items-center">
                            <Checkbox
                              id={`mob-cat-${cat.id}`}
                              checked={selectedCategory === cat.id}
                              onCheckedChange={() => {
                                setSelectedCategory(cat.id)
                                setSelectedSubcategory("all")
                              }}
                            />
                            <Label htmlFor={`mob-cat-${cat.id}`} className="ml-2 text-sm cursor-pointer capitalize">
                              {cat.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Ordenar por
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("featured")}>Destacados</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-asc")}>Precio: Menor a Mayor</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-desc")}>Precio: Mayor a Menor</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>Nombre A-Z</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Products */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Link key={product.id} href={`/productos/${product.id}`}>
                    <Card className="group overflow-hidden border-border hover:shadow-lg transition-shadow h-full">
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        {product.badge && (
                          <Badge className="absolute top-3 left-3 z-10 bg-accent-bg text-foreground border-0">
                            {product.badge}
                          </Badge>
                        )}
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
                        <h3 className="font-medium mb-2 text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="font-semibold text-foreground">${product.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {product.colors.slice(0, 3).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{
                                backgroundColor:
                                  color === "Azul"
                                    ? "#4A90E2"
                                    : color === "Negro"
                                      ? "#000"
                                      : color === "Gris"
                                        ? "#888"
                                        : color === "Mint"
                                          ? "#A8E6CF"
                                          : color === "Rosa"
                                            ? "#FFB6C1"
                                            : "#ddd",
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron productos con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
