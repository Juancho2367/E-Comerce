"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2,
  Lock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Esquema de validación
const checkoutSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  newsletter: z.boolean().default(false),
  country: z.string().min(1, { message: "Selecciona un país" }),
  firstName: z.string().min(2, { message: "El nombre es requerido" }),
  lastName: z.string().min(2, { message: "El apellido es requerido" }),
  address: z.string().min(5, { message: "La dirección es requerida" }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: "La ciudad es requerida" }),
  state: z.string().min(2, { message: "El departamento es requerido" }),
  zipCode: z.string().optional(),
  phone: z.string().min(7, { message: "Teléfono válido requerido" }),
  saveInfo: z.boolean().default(false),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["credit_card", "mercado_pago", "sistecredito", "addi", "cod"]),
  billingAddress: z.enum(["same", "different"])
})

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

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  
  // Cargar carrito
  useEffect(() => {
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
  }, [])

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      newsletter: true,
      country: "CO",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      saveInfo: true,
      shippingMethod: "standard",
      paymentMethod: "cod",
      billingAddress: "same"
    }
  })

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    toast.success("¡Pedido realizado con éxito!", {
      description: "Gracias por tu compra en ÉLITE."
    })
    
    // Simular proceso
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Limpiar carrito
    localStorage.removeItem('cartItems')
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Redirigir a confirmación (o home por ahora)
    router.push('/')
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100000 ? 0 : 15000
  const total = subtotal + shipping

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-primary">Cargando checkout...</div>
    </div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-light mb-4">Tu carrito está vacío</h1>
        <Button asChild><Link href="/productos">Ir a comprar</Link></Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
        
        {/* Columna Izquierda: Formulario */}
        <div className="px-4 py-8 lg:px-12 lg:py-12 order-2 lg:order-1 lg:border-r border-border">
          <div className="max-w-xl mx-auto">
            {/* Header Mobile Only */}
            <div className="lg:hidden mb-6 text-center">
              <Link href="/" className="text-3xl font-light tracking-[0.2em]">ÉLITE</Link>
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center text-xs text-muted-foreground mb-8">
              <Link href="/carrito" className="hover:text-primary transition-colors">Carrito</Link>
              <ChevronRight className="h-3 w-3 mx-2" />
              <span className="text-primary font-medium">Información y Pago</span>
            </nav>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Sección Contacto */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Contacto</h2>
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Iniciar sesión
                    </Link>
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Correo electrónico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-muted-foreground">
                            Enviarme novedades y ofertas por correo electrónico
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Sección Entrega */}
                <section className="space-y-4">
                  <h2 className="text-lg font-medium">Entrega</h2>
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="País / Región" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CO">Colombia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Apellidos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Casa, apartamento, etc. (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormControl>
                            <Input placeholder="Ciudad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ANT">Antioquia</SelectItem>
                              <SelectItem value="ATL">Atlántico</SelectItem>
                              <SelectItem value="BOG">Bogotá D.C.</SelectItem>
                              <SelectItem value="VAL">Valle del Cauca</SelectItem>
                              {/* Más departamentos... */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormControl>
                            <Input placeholder="Código postal (opcional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="Teléfono" {...field} className="pl-10" />
                            <div className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                              ?
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saveInfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal text-muted-foreground">
                            Guardar mi información y consultar más rápidamente la próxima vez
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Métodos de Envío */}
                <section className="pt-4">
                  <h2 className="text-lg font-medium mb-4">Método de envío</h2>
                  <div className="border rounded-lg p-4 flex justify-between items-center bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Truck className="text-muted-foreground h-5 w-5" />
                      <span className="text-sm">Envío Estándar</span>
                    </div>
                    <span className="font-medium">{shipping === 0 ? "GRATIS" : `$${shipping.toLocaleString()}`}</span>
                  </div>
                </section>

                {/* Pago */}
                <section className="pt-4">
                  <h2 className="text-lg font-medium mb-1">Pago</h2>
                  <p className="text-sm text-muted-foreground mb-4">Todas las transacciones son seguras y están encriptadas.</p>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-0 border rounded-lg overflow-hidden"
                          >
                            {/* Tarjeta de Crédito */}
                            <div className="flex flex-col border-b bg-card has-[:checked]:bg-muted/10 transition-colors">
                              <div className="flex items-center justify-between px-4 py-3 w-full">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="credit_card" id="cc" />
                                  <Label htmlFor="cc" className="cursor-pointer font-normal">Tarjeta de crédito</Label>
                                </div>
                                <div className="flex gap-1">
                                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                              </div>
                              {field.value === "credit_card" && (
                                <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                  <div className="relative">
                                    <Input placeholder="Número de tarjeta" className="bg-white" />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Fecha de vencimiento (MM / AA)" className="bg-white" />
                                    <div className="relative">
                                      <Input placeholder="Código de seguridad" className="bg-white" />
                                      <div className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-help">?</div>
                                    </div>
                                  </div>
                                  <Input placeholder="Nombre del titular" className="bg-white" />
                                  <div className="grid grid-cols-2 gap-3">
                                     <Select>
                                      <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="C.C." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="cc">C.C.</SelectItem>
                                        <SelectItem value="ce">C.E.</SelectItem>
                                        <SelectItem value="nit">NIT</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input placeholder="Número de documento" className="bg-white" />
                                  </div>
                                  <Select>
                                    <SelectTrigger className="bg-white">
                                      <SelectValue placeholder="Cuotas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 12, 24, 36].map(i => (
                                        <SelectItem key={i} value={i.toString()}>{i} {i === 1 ? 'cuota' : 'cuotas'}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">Si hay intereses, los aplicará y cobrará tu banco.</p>
                                </div>
                              )}
                            </div>

                            {/* Mercado Pago */}
                            <div className="flex flex-col border-b bg-card has-[:checked]:bg-muted/10 transition-colors">
                              <div className="flex items-center justify-between px-4 py-3 w-full">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mercado_pago" id="mp" />
                                  <Label htmlFor="mp" className="cursor-pointer font-normal">Mercado Pago</Label>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-200 bg-blue-50">PSE / Tarjetas</Badge>
                                </div>
                              </div>
                              {field.value === "mercado_pago" && (
                                <div className="p-6 pt-2 text-center animate-in fade-in slide-in-from-top-2 bg-muted/20 border-t mx-0">
                                  <div className="mx-auto w-16 h-12 border rounded flex items-center justify-center mb-4 bg-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><path d="m9 15 3 3 3-3"/></svg>
                                  </div>
                                  <p className="text-sm text-foreground mb-1">Después de hacer clic en "Finalizar el pedido", serás redirigido a Mercado Pago para completar tu compra de forma segura.</p>
                                </div>
                              )}
                            </div>

                            {/* Sistecredito */}
                            <div className="flex flex-col border-b bg-card has-[:checked]:bg-muted/10 transition-colors">
                              <div className="flex items-center justify-between px-4 py-3 w-full">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sistecredito" id="st" />
                                  <Label htmlFor="st" className="cursor-pointer font-normal">Sistecredito</Label>
                                </div>
                                <div className="h-6">
                                  <img src="/images/payments/sistecredito.png" alt="Sistecredito" className="h-full object-contain" />
                                </div>
                              </div>
                              {field.value === "sistecredito" && (
                                <div className="p-6 pt-2 text-center animate-in fade-in slide-in-from-top-2 bg-muted/20 border-t mx-0">
                                  <div className="mx-auto w-16 h-12 border rounded flex items-center justify-center mb-4 bg-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><path d="m9 15 3 3 3-3"/></svg>
                                  </div>
                                  <p className="text-sm text-foreground mb-1">Después de hacer clic en "Finalizar el pedido", serás redirigido a Sistecredito para completar tu compra de forma segura.</p>
                                </div>
                              )}
                            </div>

                             {/* Addi */}
                             <div className="flex flex-col border-b bg-card has-[:checked]:bg-muted/10 transition-colors">
                              <div className="flex items-center justify-between px-4 py-3 w-full">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="addi" id="addi" />
                                  <Label htmlFor="addi" className="cursor-pointer font-normal">Addi</Label>
                                </div>
                                <div className="h-6">
                                  <img src="/images/payments/addi.png" alt="Addi" className="h-full object-contain" />
                                </div>
                              </div>
                              {field.value === "addi" && (
                                <div className="p-6 pt-2 text-center animate-in fade-in slide-in-from-top-2 bg-muted/20 border-t mx-0">
                                  <div className="mx-auto w-16 h-12 border rounded flex items-center justify-center mb-4 bg-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><path d="m9 15 3 3 3-3"/></svg>
                                  </div>
                                  <p className="text-sm text-foreground mb-1">Después de hacer clic en "Finalizar el pedido", serás redirigido a Addi para completar tu compra de forma segura.</p>
                                </div>
                              )}
                            </div>

                            {/* Contra Entrega */}
                            <div className="flex flex-col border-b px-4 py-3 bg-card has-[:checked]:bg-muted/10 transition-colors">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cod" id="cod" />
                                  <Label htmlFor="cod" className="cursor-pointer font-normal">Pago contra entrega</Label>
                                </div>
                              </div>
                              {field.value === "cod" && (
                                <div className="mt-3 ml-6 p-4 bg-muted/30 rounded text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                                  <p>Realiza tu pedido y págalo al recibir con efectivo o transferencia.</p>
                                </div>
                              )}
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Dirección de Facturación */}
                <section className="pt-4">
                  <h2 className="text-lg font-medium mb-4">Dirección de facturación</h2>
                  <FormField
                     control={form.control}
                     name="billingAddress"
                     render={({ field }) => (
                       <FormItem>
                         <FormControl>
                           <RadioGroup
                             onValueChange={field.onChange}
                             defaultValue={field.value}
                             className="flex flex-col gap-0 border rounded-lg overflow-hidden"
                           >
                             <div className="flex items-center space-x-2 border-b px-4 py-3 has-[:checked]:bg-muted/10">
                               <RadioGroupItem value="same" id="billing-same" />
                               <Label htmlFor="billing-same" className="cursor-pointer font-normal">La misma dirección de envío</Label>
                             </div>
                             <div className="flex items-center space-x-2 px-4 py-3 has-[:checked]:bg-muted/10">
                               <RadioGroupItem value="different" id="billing-diff" />
                               <Label htmlFor="billing-diff" className="cursor-pointer font-normal">Usar una dirección de facturación distinta</Label>
                             </div>
                           </RadioGroup>
                         </FormControl>
                       </FormItem>
                     )}
                   />
                </section>

                <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium mt-8">
                  Finalizar el pedido
                </Button>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center pt-4 underline">
                  <Link href="#">Política de reembolso</Link>
                  <Link href="#">Envío</Link>
                  <Link href="#">Política de privacidad</Link>
                  <Link href="#">Términos del servicio</Link>
                </div>

              </form>
            </Form>
          </div>
        </div>

        {/* Columna Derecha: Resumen (Desktop) / Accordion (Mobile) */}
        <div className="bg-muted/30 lg:bg-muted/20 order-1 lg:order-2 border-b lg:border-l lg:border-b-0 border-border">
          <div className="lg:hidden p-4 bg-muted/20 border-b border-border">
             <button 
               onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
               className="flex w-full items-center justify-between text-sm font-medium text-primary"
             >
               <span className="flex items-center gap-2">
                 <ShoppingBag className="h-4 w-4" /> 
                 {isOrderSummaryOpen ? "Ocultar resumen del pedido" : "Mostrar resumen del pedido"}
                 {isOrderSummaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
               </span>
               <span className="font-semibold text-lg">${total.toLocaleString()}</span>
             </button>
          </div>

          <div className={cn("px-4 py-8 lg:px-12 lg:py-12 lg:sticky lg:top-0", isOrderSummaryOpen ? "block" : "hidden lg:block")}>
            <div className="max-w-md mx-auto space-y-6">
               {cartItems.map((item) => (
                 <div key={item.id} className="flex items-center gap-4">
                   <div className="relative">
                     <div className="w-16 h-16 bg-white border border-border rounded-md overflow-hidden flex items-center justify-center relative">
                       <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                     </div>
                     <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 bg-gray-500 text-white border-2 border-white">{item.quantity}</Badge>
                   </div>
                   <div className="flex-1">
                     <p className="font-medium text-sm text-foreground">{item.name}</p>
                     <p className="text-xs text-muted-foreground">{item.color} / {item.size}</p>
                   </div>
                   <div className="text-sm font-medium">
                     ${(item.price * item.quantity).toLocaleString()}
                   </div>
                 </div>
               ))}

               <div className="flex gap-2 pt-4">
                 <Input placeholder="Código de descuento o tarjeta de regalo" className="bg-white" />
                 <Button variant="outline" disabled>Aplicar</Button>
               </div>

               <div className="space-y-3 pt-6 border-t border-border/50">
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Subtotal</span>
                   <span className="font-medium">${subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Envío</span>
                   <span className="font-medium text-xs">{shipping === 0 ? "GRATIS" : `$${shipping.toLocaleString()}`}</span>
                 </div>
               </div>

               <div className="flex justify-between items-center pt-6 border-t border-border/50">
                 <span className="text-base font-medium">Total</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-xs text-muted-foreground">COP</span>
                   <span className="text-2xl font-semibold">${total.toLocaleString()}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

