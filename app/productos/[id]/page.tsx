"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Truck, RefreshCw, ShieldCheck, ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { productService } from "@/services/product.service"
import type { Product } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return

      setIsLoading(true)
      try {
        const foundProduct = await productService.getProductById(productId)
        setProduct(foundProduct)

        if (foundProduct) {
          const products = await productService.getProductsByCategory(foundProduct.category)
          const related = products
            .filter((p) => p.id !== foundProduct.id)
            .slice(0, 4)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return

    if (!selectedSize) {
      toast({
        title: "Selecciona una talla",
        description: "Por favor selecciona una talla antes de agregar al carrito",
        variant: "destructive",
      })
      return
    }
    if (!selectedColor) {
      toast({
        title: "Selecciona un color",
        description: "Por favor selecciona un color antes de agregar al carrito",
        variant: "destructive",
      })
      return
    }

    // Guardar en localStorage (funciona para usuarios autenticados y no autenticados)
    const cartItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    }

    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
    existingCart.push(cartItem)
    localStorage.setItem('cartItems', JSON.stringify(existingCart))

    // Disparar evento personalizado para actualizar el contador del header
    window.dispatchEvent(new Event('cartUpdated'))

    toast({
      title: "Producto agregado al carrito",
      description: `${product.name} - Talla: ${selectedSize}, Color: ${selectedColor}`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-light mb-4">Producto no encontrado</h1>
        <Button asChild variant="outline">
          <Link href="/productos">Volver a productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="px-0 text-muted-foreground hover:text-foreground">
            <Link href="/productos">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver a productos
            </Link>
          </Button>
        </div>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              {product.badge && (
                <Badge className="absolute top-4 left-4 z-10 bg-accent-bg text-foreground border-0">
                  {product.badge}
                </Badge>
              )}
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-primary">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-semibold text-foreground">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <Badge variant="destructive" className="ml-2">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            <Separator className="my-6" />

            {/* Size Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">
                Talla {selectedSize && <span className="text-muted-foreground font-normal">- {selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="w-12 h-12"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">
                Color {selectedColor && <span className="text-muted-foreground font-normal">- {selectedColor}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                    }`}
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
                                  : color === "Azul Claro"
                                    ? "#87CEEB"
                                    : color === "Turquesa"
                                      ? "#40E0D0"
                                      : color === "Blanco"
                                        ? "#fff"
                                        : "#ddd",
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Cantidad</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Agregar al Carrito
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Truck className="h-5 w-5 flex-shrink-0" />
                <span>Envío gratis en compras superiores a $100.000</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-5 w-5 flex-shrink-0" />
                <span>Devolución gratis dentro de 30 días</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-light tracking-wide mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} href={`/productos/${relProduct.id}`}>
                  <Card className="group overflow-hidden border-border hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {relProduct.badge && (
                        <Badge className="absolute top-3 left-3 z-10 bg-accent-bg text-foreground border-0">
                          {relProduct.badge}
                        </Badge>
                      )}
                      <img
                        src={relProduct.images[0] || "/placeholder.svg"}
                        alt={relProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {relProduct.category}
                      </p>
                      <h3 className="font-medium mb-2 text-foreground group-hover:text-primary transition-colors">
                        {relProduct.name}
                      </h3>
                      <span className="font-semibold text-foreground">${relProduct.price.toLocaleString()}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </>
  )
}
