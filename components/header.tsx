"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, User, Heart, ShoppingCart, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { categories } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { isAuthenticated, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/registro"

  // Actualizar contador del carrito
  useEffect(() => {
    const updateCartCount = () => {
      if (isAuthenticated) {
        const savedCart = localStorage.getItem('cartItems')
        if (savedCart) {
          try {
            const cart = JSON.parse(savedCart)
            const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
            setCartCount(total)
          } catch (error) {
            setCartCount(0)
          }
        } else {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      updateCartCount()
    }

    window.addEventListener('storage', handleStorageChange)
    // También verificar periódicamente (por si el cambio es en la misma pestaña)
    const interval = setInterval(updateCartCount, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isAuthenticated])

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
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden md:flex">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Mi Cuenta</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                    <Link href="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link href="/carrito">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
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
