"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      productId: "1",
      name: "Jean Clásico Azul",
      price: 1299,
      image: "/placeholder.svg?height=200&width=150",
      size: "M",
      color: "Azul",
      quantity: 1,
    },
    {
      id: "2",
      productId: "2",
      name: "Jean Denim Premium",
      price: 1499,
      image: "/placeholder.svg?height=200&width=150",
      size: "L",
      color: "Negro",
      quantity: 2,
    },
  ])

  const [couponCode, setCouponCode] = useState("")

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100000 ? 0 : 15000
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-light tracking-wide mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agrega productos a tu carrito para comenzar tu compra</p>
          <Button size="lg" asChild>
            <Link href="/productos">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-8">Carrito de Compras</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator />}
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div>
                            <Link
                              href={`/productos/${item.productId}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                            <div className="text-sm text-muted-foreground mt-1">
                              Talla: {item.size} | Color: {item.color}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              ${(item.price * item.quantity).toLocaleString()}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-muted-foreground">${item.price.toLocaleString()} c/u</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <Button variant="ghost" asChild className="mt-4">
            <Link href="/productos">Continuar Comprando</Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Agrega ${(100000 - subtotal).toLocaleString()} más para envío gratis
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Código de descuento</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline">Aplicar</Button>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">
                  Proceder al Pago
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Aceptamos todos los métodos de pago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
