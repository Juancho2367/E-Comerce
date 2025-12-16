"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { products } from "@/lib/mock-data"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "orders">("dashboard")

  // Mock data
  const stats = [
    { title: "Total Ventas", value: "$45,231", change: "+20.1%", icon: TrendingUp },
    { title: "Productos", value: products.length.toString(), change: "+5", icon: Package },
    { title: "Órdenes", value: "156", change: "+12", icon: ShoppingCart },
    { title: "Clientes", value: "2,345", change: "+180", icon: Users },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "María García", total: 2499, status: "Completado", date: "2025-12-15" },
    { id: "ORD-002", customer: "Juan Pérez", total: 1299, status: "Procesando", date: "2025-12-15" },
    { id: "ORD-003", customer: "Ana López", total: 3899, status: "Enviado", date: "2025-12-14" },
    { id: "ORD-004", customer: "Carlos Ruiz", total: 899, status: "Pendiente", date: "2025-12-14" },
  ]

  const categories = [
    { id: "1", name: "Mujer", products: 45 },
    { id: "2", name: "Gym", products: 32 },
    { id: "3", name: "Accesorios", products: 18 },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h2 className="text-xl font-light tracking-widest">ÉLITE Admin</h2>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "products" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("products")}
          >
            <Package className="h-4 w-4 mr-2" />
            Productos
          </Button>
          <Button
            variant={activeTab === "categories" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("categories")}
          >
            <Layers className="h-4 w-4 mr-2" />
            Categorías
          </Button>
          <Button
            variant={activeTab === "orders" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Órdenes
          </Button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Volver a la Tienda
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-light">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "products" && "Gestión de Productos"}
              {activeTab === "categories" && "Gestión de Categorías"}
              {activeTab === "orders" && "Gestión de Órdenes"}
            </h1>
            <div className="flex items-center gap-2">
              {activeTab === "products" && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              )}
              {activeTab === "categories" && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-green-600 mt-1">{stat.change} desde el último mes</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Órdenes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total.toLocaleString()}</p>
                          <Badge
                            variant={
                              order.status === "Completado"
                                ? "default"
                                : order.status === "Procesando"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mt-1"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "products" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.slice(0, 8).map((product) => (
                        <tr key={product.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.badge && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {product.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize">{product.category}</td>
                          <td className="px-6 py-4 font-medium">${product.price.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Activo
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.products} productos</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/productos?category=${category.id}`}>Ver Productos</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          ID Orden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium">{order.id}</td>
                          <td className="px-6 py-4">{order.customer}</td>
                          <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                          <td className="px-6 py-4 font-semibold">${order.total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                order.status === "Completado"
                                  ? "default"
                                  : order.status === "Procesando"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm">
                              Ver Detalles
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
