'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: RecommendedProduct[]
}

interface RecommendedProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  url: string
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy tu asesor de estilo de ÉLITE. ¿Cómo te llamas y para qué ocasión buscas tu outfit?',
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

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    const currentInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Llamar a la API de Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Error al obtener respuesta')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      toast.error('Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.')
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo? 😊',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
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
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-primary/20">
                    <Image 
                      src="/eliteicon.png" 
                      alt="ELITE IA" 
                      width={48} 
                      height={48}
                      className="object-cover scale-[1.6] object-[center_28%]"
                    />
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-sm border border-primary/20">
                      <Image 
                        src="/eliteicon.png" 
                        alt="ELITE IA" 
                        width={40} 
                        height={40}
                        className="object-cover scale-[1.6] object-[center_28%]"
                      />
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
                          // Detectar texto en negrita con **
                          if (line.includes('**')) {
                            const parts = line.split('**')
                            return (
                              <p key={idx} className="my-1">
                                {parts.map((part, i) => 
                                  i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                                )}
                              </p>
                            )
                          }
                          // Detectar listas con •, -, o números
                          if (line.match(/^[\s]*[•\-\*]/) || line.match(/^[\s]*\d+\./)) {
                            return (
                              <div key={idx} className="ml-3 my-1 flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{line.replace(/^[\s]*[•\-\*]\s*/, '').replace(/^[\s]*\d+\.\s*/, '')}</span>
                              </div>
                            )
                          }
                          return <p key={idx} className="my-1">{line || '\u00A0'}</p>
                        })}
                        {message.recommendations && message.recommendations.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Recomendaciones</p>
                            <div className="grid grid-cols-2 gap-3">
                              {message.recommendations.slice(0, 2).map((rec) => (
                                <a
                                  key={rec.id}
                                  href={rec.url}
                                  className="block rounded-xl overflow-hidden border border-border bg-background hover:bg-muted/40 transition-colors"
                                >
                                  <div className="relative aspect-[3/4] bg-muted">
                                    <Image
                                      src={rec.imageUrl}
                                      alt={rec.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 40vw, 200px"
                                    />
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs font-medium leading-snug line-clamp-2">{rec.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">${Number(rec.price).toLocaleString()}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
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
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden shadow-sm border border-primary/20">
                    <Image 
                      src="/eliteicon.png" 
                      alt="ELITE IA" 
                      width={40} 
                      height={40}
                      className="object-cover scale-[1.6] object-[center_28%]"
                    />
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
                onClick={() => setInput("¿Qué outfit me recomiendas para una cita?")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                Outfit para cita
              </button>
              <button
                onClick={() => setInput("¿Cómo combino un jean azul?")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                Combinar jean
              </button>
              <button
                onClick={() => setInput("Colores que me favorecen")}
                className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
              >
                Colores ideales
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

