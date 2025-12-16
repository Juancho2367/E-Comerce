import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Truck, ShieldCheck, Clock } from "lucide-react"
import { productService } from "@/services/product.service"

export default async function HomePage() {
  const featuredProducts = await productService.getFeaturedProducts()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('/images/screenshot-202025-12-16-20012113.png')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <Badge className="mb-4 bg-accent-bg text-foreground border-0">COLECCIÓN INVIERNO 2025</Badge>
          <h1 className="text-5xl md:text-7xl font-light tracking-wide mb-6 text-balance">
            Elegancia
            <br />
            Sin Límites
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 text-pretty">
            Descubre nuestra selección exclusiva de piezas de alta costura que definen el lujo contemporáneo
          </p>
          <Button size="lg" variant="secondary" asChild className="group">
            <Link href="/productos">
              Explorar Colección
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-light tracking-wide mb-2">Descubre nuestra selección exclusiva</h2>
              <p className="text-muted-foreground">Piezas cuidadosamente seleccionadas para ti</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/productos">
                Ver Todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/productos/${product.id}`}>
                <Card className="group overflow-hidden border-border hover:shadow-lg transition-shadow">
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

          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" asChild>
              <Link href="/productos">Ver Todos los Productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Envío Gratis</h3>
              <p className="text-sm text-muted-foreground">En compras superiores a $100.000</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Compra Segura</h3>
              <p className="text-sm text-muted-foreground">Protección en todas tus compras</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Devolución Fácil</h3>
              <p className="text-sm text-muted-foreground">30 días para cambios y devoluciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-light tracking-wide mb-4">Únete a ÉLITE</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Suscríbete para recibir ofertas exclusivas y ser el primero en conocer nuestras nuevas colecciones
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button variant="secondary" size="lg">
              Suscribirse
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
