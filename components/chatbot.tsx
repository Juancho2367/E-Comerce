'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { products } from '@/lib/mock-data'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  productId?: string
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de ÉLITE. ¿En qué puedo ayudarte hoy? Puedo ayudarte a encontrar productos, sugerir outfits o darte recomendaciones de estilo.',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  // Scroll automático cuando hay nuevos mensajes
  useEffect(() => {
    if (shouldAutoScroll && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const timer = setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, isTyping, shouldAutoScroll])

  // Detectar cuando el usuario hace scroll manual
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setShouldAutoScroll(isAtBottom)
    }
  }

  const handleProductSearch = (query: string): Message[] => {
    const lowerQuery = query.toLowerCase()
    const matchingProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.subcategory.toLowerCase().includes(lowerQuery) ||
        product.colors.some((color) => color.toLowerCase().includes(lowerQuery))
    )

    if (matchingProducts.length === 0) {
      return [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `No encontré productos que coincidan con "${query}". ¿Podrías ser más específico? Por ejemplo, puedes preguntar por "jeans", "leggings", o "tops deportivos".`,
        },
      ]
    }

    const productList = matchingProducts
      .slice(0, 3)
      .map(
        (product) =>
          `• **${product.name}** - $${product.price.toLocaleString()}${product.badge ? ` (${product.badge})` : ''}\n  ${product.description}`
      )
      .join('\n\n')

    return matchingProducts.slice(0, 3).map((product) => ({
      id: `${Date.now()}-${product.id}`,
      role: 'assistant' as const,
      content: `Encontré estos productos:\n\n${productList}\n\n¿Te gustaría ver más detalles de alguno?`,
      productId: product.id,
    }))
  }

  const handleOutfitRecommendation = (): Message => {
    const outfits = [
      {
        name: 'Look Casual Elegante',
        items: ['Jean Clásico Azul', 'Top Deportivo Negro'],
        description: 'Perfecto para el día a día con un toque sofisticado.',
      },
      {
        name: 'Look Deportivo',
        items: ['Conjunto Deportivo Mint', 'Legging Deportivo Mint'],
        description: 'Ideal para entrenar o hacer ejercicio con estilo.',
      },
      {
        name: 'Look Versátil',
        items: ['Jean Recto Claro', 'Top Deportivo Negro'],
        description: 'Un look que puedes usar en cualquier ocasión.',
      },
    ]

    const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)]
    const outfitText = `**${randomOutfit.name}**\n\n${randomOutfit.items.join(' + ')}\n\n${randomOutfit.description}\n\n¿Te gustaría ver alguno de estos productos?`

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: outfitText,
    }
  }

  const handleGeneralRecommendation = (): Message => {
    const recommendations = [
      'Te recomiendo explorar nuestra colección de jeans. Tenemos opciones desde $1,199 hasta $1,499, con diferentes cortes y estilos.',
      'Si buscas algo para el gym, tenemos conjuntos deportivos y leggings de alta calidad con tecnología anti-sudor.',
      'Para un look completo, combina nuestros jeans con alguno de nuestros tops deportivos. ¡Quedarás increíble!',
      'Nuestra colección incluye productos nuevos y ediciones limitadas. ¡No te los pierdas!',
    ]

    const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)]

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: randomRec,
    }
  }

  const processMessage = (userMessage: string): Message[] => {
    const lowerMessage = userMessage.toLowerCase()

    // Búsqueda de productos
    if (
      lowerMessage.includes('producto') ||
      lowerMessage.includes('jean') ||
      lowerMessage.includes('legging') ||
      lowerMessage.includes('top') ||
      lowerMessage.includes('conjunto') ||
      lowerMessage.includes('buscar') ||
      lowerMessage.includes('tienes') ||
      lowerMessage.includes('hay')
    ) {
      return handleProductSearch(userMessage)
    }

    // Recomendaciones de outfits
    if (
      lowerMessage.includes('outfit') ||
      lowerMessage.includes('combinar') ||
      lowerMessage.includes('look') ||
      lowerMessage.includes('vestir') ||
      lowerMessage.includes('poner')
    ) {
      return [handleOutfitRecommendation()]
    }

    // Recomendaciones generales
    if (
      lowerMessage.includes('recomend') ||
      lowerMessage.includes('suger') ||
      lowerMessage.includes('qué') ||
      lowerMessage.includes('ayuda') ||
      lowerMessage.includes('ayudar')
    ) {
      return [handleGeneralRecommendation()]
    }

    // Saludo
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenos')) {
      return [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '¡Hola! 😊 ¿En qué puedo ayudarte? Puedo ayudarte a encontrar productos, sugerir outfits o darte recomendaciones.',
        },
      ]
    }

    // Respuesta por defecto
    return [
      {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'Entiendo. ¿Podrías ser más específico? Puedo ayudarte con:\n\n• Búsqueda de productos\n• Recomendaciones de outfits\n• Sugerencias de estilo\n\n¿Qué te gustaría hacer?',
      },
    ]
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simular delay de respuesta
    setTimeout(() => {
      const responses = processMessage(input)
      setMessages((prev) => [...prev, ...responses])
      setIsTyping(false)
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-auto px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2"
        size="lg"
      >
        <div className="relative">
          <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        </div>
        <span className="font-medium text-sm">ELITE IA</span>
      </Button>

      {/* Panel de chat */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-gradient-to-b from-background to-muted/20">
          <SheetHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                  </span>
                </div>
                <div>
                  <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                    Asistente ÉLITE
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">En línea • Responde al instante</p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 px-4 md:px-6 py-6 overflow-y-auto bg-gradient-to-b from-transparent via-background/50 to-background"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <div className="space-y-6 py-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 items-end ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                        : 'bg-card text-foreground border border-border rounded-bl-sm'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content.split('\n').map((line, idx) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <strong key={idx} className="font-semibold text-foreground block mb-1">
                                {line.slice(2, -2)}
                              </strong>
                            )
                          }
                          if (line.startsWith('•')) {
                            return (
                              <div key={idx} className="ml-3 my-1 flex items-start gap-2">
                                <span className="text-primary mt-1.5">•</span>
                                <span>{line.substring(1).trim()}</span>
                              </div>
                            )
                          }
                          return <p key={idx} className="my-1">{line || '\u00A0'}</p>
                        })}
                        {message.productId && (
                          <Link
                            href={`/productos/${message.productId}`}
                            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs transition-colors border border-primary/20"
                          >
                            Ver producto
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start items-end animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-gradient-to-t from-background to-background/95 backdrop-blur-sm px-4 md:px-6 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="pr-12 rounded-full border-2 focus:border-primary/50 transition-colors"
                />
              </div>
              <Button 
                onClick={handleSend} 
                size="icon" 
                disabled={!input.trim() || isTyping}
                className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Sugerencias:</span>
              <button
                onClick={() => setInput("¿Qué jeans tienes?")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                ¿Qué jeans tienes?
              </button>
              <button
                onClick={() => setInput("Sugerencia de outfit")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                Sugerencia de outfit
              </button>
              <button
                onClick={() => setInput("Recomendaciones")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                Recomendaciones
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

