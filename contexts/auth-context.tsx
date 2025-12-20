'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      setIsAuthenticated(authStatus === 'true')
      setIsLoading(false)
    }

    checkAuth()

    // Escuchar cambios en localStorage (para cuando se inicia sesión en otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated') {
        setIsAuthenticated(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = () => {
    // Antes de iniciar sesión, guardar el carrito actual (si existe)
    // Esto permite migrar el carrito del usuario no autenticado al autenticado
    const currentCart = localStorage.getItem('cartItems')
    
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
    
    // Si había un carrito antes de iniciar sesión, se mantiene
    // En una implementación real con Supabase, aquí se migraría el carrito
    // desde session_id o localStorage al user_id en la base de datos
    
    // Disparar evento para actualizar componentes que dependen del estado de autenticación
    window.dispatchEvent(new Event('authStateChanged'))
  }

  const logout = () => {
    // Opcional: mantener el carrito al cerrar sesión (para mejor UX)
    // O eliminar el carrito si se prefiere
    // localStorage.removeItem('cartItems') // Descomentar si quieres limpiar el carrito al cerrar sesión
    
    localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
    
    // Disparar evento para actualizar componentes
    window.dispatchEvent(new Event('authStateChanged'))
    window.dispatchEvent(new Event('cartUpdated'))
    
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

