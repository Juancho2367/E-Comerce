"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, LogIn, Sparkles, Gift, History, Shield, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

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
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Cargar carrito (funciona para usuarios autenticados y no autenticados)
  useEffect(() => {
    if (!authLoading) {
      // Cargar carrito desde localStorage (sin importar si está autenticado)
      const savedCart = localStorage.getItem('cartItems')
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart)
          setCartItems(cart)
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      }
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading])

  // Escuchar cambios en el carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      const savedCart = localStorage.getItem('cartItems')
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart)
          setCartItems(cart)
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      } else {
        setCartItems([])
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [])

  const [couponCode, setCouponCode] = useState("")

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    const updated = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updated)
    localStorage.setItem('cartItems', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id)
    setCartItems(updated)
    localStorage.setItem('cartItems', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100000 ? 0 : 15000
  const total = subtotal + shipping

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-light tracking-wide">Carrito de Compras</h1>
      </div>

      {/* Banner de beneficios para usuarios no autenticados */}
      {!isAuthenticated && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold">¿No tienes cuenta? ¡Créala ahora y obtén beneficios exclusivos!</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="flex items-start gap-2">
                <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Descuentos exclusivos</p>
                  <p className="text-xs text-muted-foreground">Hasta 15% OFF en tu primera compra</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <History className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Historial de compras</p>
                  <p className="text-xs text-muted-foreground">Accede a tus pedidos anteriores</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Compra más segura</p>
                  <p className="text-xs text-muted-foreground">Protección adicional en tus compras</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button size="sm" asChild>
                <Link href={`/login?redirect=${encodeURIComponent('/carrito')}`}>
                  Iniciar Sesión
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/registro?redirect=${encodeURIComponent('/carrito')}`}>
                  Crear Cuenta
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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

              {!isAuthenticated && (
                <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                  <AlertDescription className="text-sm">
                    <strong>💡 Tip:</strong> Inicia sesión para un proceso de pago más rápido y seguro, además de acceder a descuentos exclusivos.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => setShowPaymentModal(true)}
              >
                Proceder al Pago
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground mb-3">Aceptamos todos los métodos de pago</p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {/* Mastercard */}
                  <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-border/50 p-1.5 shadow-sm hover:shadow transition-shadow" title="Mastercard">
                    <svg viewBox="0 0 24 16" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="8" r="6" fill="#EB001B"/>
                      <circle cx="15" cy="8" r="6" fill="#F79E1B"/>
                      <path d="M12 4.5c-1.2 1-2 2.5-2 4.2s.8 3.2 2 4.2c1.2-1 2-2.5 2-4.2s-.8-3.2-2-4.2z" fill="#FF5F00"/>
                    </svg>
                  </div>
                  
                  {/* American Express */}
                  <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-border/50 p-1.5 shadow-sm hover:shadow transition-shadow overflow-hidden" title="American Express">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/349/349228.png" 
                      alt="American Express" 
                      className="w-full h-full object-contain scale-180"
                    />
                  </div>
                  
                  {/* PayPal */}
                  <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-border/50 p-1.5 shadow-sm hover:shadow transition-shadow overflow-hidden" title="PayPal">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/174/174861.png" 
                      alt="PayPal" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* PSE */}
                  <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-border/50 p-0 shadow-sm hover:shadow transition-shadow overflow-hidden" title="PSE">
                    <img 
                      src="https://www.viajescircular.com.co/wp-content/uploads/2021/06/PSE.png" 
                      alt="PSE" 
                      className="w-full h-full object-contain scale-150"
                    />
                  </div>
                  
                  {/* Nequi */}
                  <div className="flex items-center justify-center w-14 h-9 bg-white rounded border border-border/50 p-1.5 shadow-sm hover:shadow transition-shadow overflow-hidden" title="Nequi">
                    <img 
                      src="https://logosenvector.com/logo/img/nequi-icono-37698.png" 
                      alt="Nequi" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-wide">
              {!isAuthenticated ? "¡Recuerda los beneficios que tienes al iniciar sesión!" : "Proceder al Pago"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {!isAuthenticated && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Al iniciar sesión obtendrás acceso a beneficios exclusivos que harán tu experiencia de compra aún mejor.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Descuentos exclusivos</p>
                        <p className="text-xs text-muted-foreground">Hasta 15% OFF en tu primera compra</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <History className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Historial de compras</p>
                        <p className="text-xs text-muted-foreground">Accede a tus pedidos anteriores</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Compra más segura</p>
                        <p className="text-xs text-muted-foreground">Protección adicional en tus compras</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  Estás a punto de proceder con el pago de tu pedido.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={() => {
                setShowPaymentModal(false)
                router.push('/checkout')
              }}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Continuar con el Pago
            </Button>
            
            {!isAuthenticated && (
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setShowPaymentModal(false)
                  router.push(`/login?redirect=${encodeURIComponent('/carrito')}`)
                }}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
