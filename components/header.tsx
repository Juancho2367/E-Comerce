"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, User, Heart, ShoppingCart, Menu, LogOut, ArrowRight, Trash2, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { categories } from "@/lib/mock-data"
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

export function Header() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/registro"

  // Actualizar contador y items del carrito (funciona para usuarios autenticados y no autenticados)
  useEffect(() => {
    const updateCart = () => {
      const savedCart = localStorage.getItem('cartItems')
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart)
          setCartItems(cart)
          const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(total)
        } catch (error) {
          setCartCount(0)
          setCartItems([])
        }
      } else {
        setCartCount(0)
        setCartItems([])
      }
    }

    updateCart()

    // Escuchar cambios en el carrito
    const handleCartUpdate = () => {
      updateCart()
    }

    // Escuchar cambios en localStorage (para sincronización entre pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartItems') {
        updateCart()
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleStorageChange)

    // También verificar periódicamente (por si el cambio es en la misma pestaña)
    const interval = setInterval(updateCart, 1000)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-light tracking-widest text-foreground">ÉLITE</h1>
          </Link>

          {/* Navigation - Desktop */}
          {!isAuthPage && (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Inicio
              </Link>
              {categories.map((category) => (
                <DropdownMenu key={category.id}>
                  <DropdownMenuTrigger className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide flex items-center gap-1">
                    {category.name}
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href={`/productos?category=${category.id}`} className="font-semibold">
                        Ver Todo {category.name}
                      </Link>
                    </DropdownMenuItem>
                    <div className="border-t my-1" />
                    {category.subcategories.map((sub) => (
                      <DropdownMenuItem key={sub} asChild>
                        <Link href={`/productos?category=${category.id}&sub=${sub}`}>{sub}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <Link
                href="/mayoristas"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Mayoristas
              </Link>
              <Link
                href="/contacto"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors uppercase tracking-wide"
              >
                Contacto
              </Link>
            </nav>
          )}

          {/* Search Bar - Desktop */}
          {!isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-xs ml-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar productos..." className="pl-9 bg-muted/50" />
              </div>
            </div>
          )}

          {/* Icons */}
          <div className="flex items-center gap-2">
            {!isAuthPage && (
              <>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Heart className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Carrito de Compras</h3>
                        <span className="text-sm text-muted-foreground">
                          {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
                        </span>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">Tu carrito está vacío</p>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                            {cartItems.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="w-16 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Talla: {item.size} | Color: {item.color}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      Cant: {item.quantity}
                                    </span>
                                    <span className="font-semibold text-sm">
                                      ${(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {cartItems.length > 3 && (
                              <p className="text-xs text-center text-muted-foreground py-2">
                                +{cartItems.length - 3} {cartItems.length - 3 === 1 ? 'artículo más' : 'artículos más'}
                              </p>
                            )}
                          </div>

                          <Separator className="my-4" />

                          <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-lg">${cartTotal.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <>
                        <Separator />
                        <div className="p-2">
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => router.push('/carrito')}
                          >
                            Ver Carrito
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle className="text-left text-2xl font-light tracking-widest">ÉLITE</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2 mt-6">
                      <Link
                        href="/"
                        className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      >
                        Inicio
                      </Link>

                      {categories.map((category) => (
                        <Collapsible key={category.id}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
                            {category.name}
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4">
                            <Link
                              href={`/productos?category=${category.id}`}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                            >
                              Ver Todo {category.name}
                            </Link>
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub}
                                href={`/productos?category=${category.id}&sub=${sub}`}
                                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                              >
                                {sub}
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}

                      <Link
                        href="/mayoristas"
                        className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      >
                        Mayoristas
                      </Link>
                      <Link
                        href="/contacto"
                        className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      >
                        Contacto
                      </Link>

                      <Link
                        href="#"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        Favoritos
                      </Link>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {!isAuthPage && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar productos..." className="pl-9 bg-muted/50" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

