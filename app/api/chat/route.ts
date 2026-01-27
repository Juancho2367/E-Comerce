import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { products } from '@/lib/mock-data'

// Inicializar Gemini API usando variable de entorno
const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('GEMINI_API_KEY no está configurada en las variables de entorno')
}

const genAI = new GoogleGenerativeAI(apiKey || '')

// Configurar el modelo (usando gemini-1.5-flash-latest - compatible con plan gratuito)
// Referencia: https://ai.google.dev/gemini-api/docs/models?hl=es-419
// Nota: Se usa el alias "-latest" que apunta a la versión más reciente disponible
const model = genAI.getGenerativeModel({ 
  model: 'gemini-3-flash-preview',
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048, // Aumentado para respuestas más completas del asesor
  },
})

type Occasion = 'cita' | 'trabajo' | 'fiesta' | 'formal' | 'casual' | 'diario' | 'gym' | 'desconocida'

interface RecommendedProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  url: string
  tag?: 'LOOK' | 'CAMBIO'
  slot?: 'top' | 'bottom'
}

const BODY_SCHEMA = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .optional(),
})

const PRODUCT_BY_ID = new Map(products.map((p) => [p.id, p]))

function toCard(productId: string, extra?: Pick<RecommendedProduct, 'tag' | 'slot'>): RecommendedProduct | null {
  const product = PRODUCT_BY_ID.get(productId)
  if (!product) return null
  const imageUrl = product.images?.[0]
  if (!imageUrl) return null
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl,
    url: `/productos/${product.id}`,
    ...extra,
  }
}

const RECOMMENDATION_IDS_BY_OCCASION: Record<Occasion, string[]> = {
  cita: ['2', '1'],
  trabajo: ['1', '2'],
  formal: ['2', '1'],
  fiesta: ['2', '4'],
  casual: ['4', '1'],
  diario: ['1', '4'],
  gym: [],
  desconocida: ['1', '2', '4'],
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function inferOccasion(message: string): Occasion {
  const t = normalizeText(message)

  if (/\bgym\b|\bentren(amiento|ar)\b|\bgimnasio\b/.test(t)) return 'gym'
  if (/\bcita\b|\bdate\b|\bnovi[oa]\b|\bromant/.test(t)) return 'cita'
  if (/\btrabajo\b|\boficina\b|\bentrevista\b|\breunion\b/.test(t)) return 'trabajo'
  if (/\bformal\b|\bgala\b|\bevento\b|\bcoctel\b/.test(t)) return 'formal'
  if (/\bfiesta\b|\bparty\b|\bcumple\b|\bdiscoteca\b/.test(t)) return 'fiesta'
  if (/\bcasual\b|\binformal\b|\brelaj/.test(t)) return 'casual'
  if (/\bdiario\b|\bdia a dia\b|\bdi[aá] a di[aá]\b/.test(t)) return 'diario'

  return 'desconocida'
}

function isRecommendationRequest(message: string): boolean {
  const t = normalizeText(message)
  return (
    /\brecomiend/.test(t) ||
    /\brecomendacion\b/.test(t) ||
    /\bsugier/.test(t) ||
    /\bque me pongo\b/.test(t) ||
    /\boutfit\b/.test(t) ||
    /\blook\b/.test(t)
  )
}

type PresetOccasion = 'casual' | 'trabajo' | 'cita' | 'fiesta'

function toPresetOccasion(occasion: Occasion): PresetOccasion | null {
  // Regla MVP: SOLO 4 ocasiones. Las demás se mapean o se consideran desconocidas.
  if (occasion === 'casual') return 'casual'
  if (occasion === 'trabajo') return 'trabajo'
  if (occasion === 'cita') return 'cita'
  if (occasion === 'fiesta') return 'fiesta'

  // Mapeos razonables (MVP)
  if (occasion === 'formal') return 'fiesta'
  if (occasion === 'diario') return 'casual'
  if (occasion === 'gym') return 'casual'

  return null
}

function extractPresetOccasion(message: string): PresetOccasion | null {
  const t = normalizeText(message)

  // Respuestas cortas típicas del usuario después de una pregunta de ocasión.
  if (/^(casual|trabajo|cita|fiesta)$/.test(t.trim())) return t.trim() as PresetOccasion

  // Variantes comunes (ej: "para trabajo", "look casual", "ocasión: fiesta")
  if (/\btrabajo\b|\boficina\b|\bentrevista\b|\breunion\b/.test(t)) return 'trabajo'
  if (/\bcita\b|\bdate\b|\bromant/.test(t)) return 'cita'
  if (/\bfiesta\b|\bparty\b|\bcumple\b|\bdiscoteca\b/.test(t)) return 'fiesta'
  if (/\bcasual\b|\bdiario\b|\binformal\b|\brelaj/.test(t)) return 'casual'

  return null
}

function buildOutfitForOccasion(preset: PresetOccasion): { message: string; recommendations: RecommendedProduct[] } {
  // Productos existentes en el mock-data (IDs):
  // Jeans: 1,2,3,4,5 | Tops: 6,7 | Conjunto gym: 8
  const commonQuestions =
    'Para dejarlo perfecto: ¿prefieres un fit más **ajustado** o más **holgado** y qué talla usas normalmente (XS–XL)? 🙂'

  if (preset === 'trabajo') {
    const look = [
      toCard('6', { tag: 'LOOK', slot: 'top' }), // Top Crop Negro
      toCard('2', { tag: 'LOOK', slot: 'bottom' }), // Jean Denim Premium
    ].filter(Boolean) as RecommendedProduct[]

    const swaps = [
      toCard('1', { tag: 'CAMBIO', slot: 'bottom' }), // Jean Clásico Azul
      toCard('4', { tag: 'CAMBIO', slot: 'bottom' }), // Jean Recto Claro
    ].filter(Boolean) as RecommendedProduct[]

    return {
      message: [
        '¡Listo! Te armé un **look para Trabajo** que se ve pulido y es muy fácil de combinar.',
        'Colorimetría: el **negro** (neutral) aporta elegancia, y el **denim azul oscuro** funciona como base fría/neutral que estiliza y se siente más “pro”.',
        'Si quieres ajustarlo con lo que hay en la tienda: un jean más claro lo hace más casual; el oscuro lo mantiene más formal.',
        commonQuestions,
      ].join('\n\n'),
      recommendations: [...look, ...swaps],
    }
  }

  if (preset === 'cita') {
    const look = [
      toCard('7', { tag: 'LOOK', slot: 'top' }), // Top Halter con Lentejuelas
      toCard('1', { tag: 'LOOK', slot: 'bottom' }), // Jean Clásico Azul
    ].filter(Boolean) as RecommendedProduct[]

    const swaps = [
      toCard('2', { tag: 'CAMBIO', slot: 'bottom' }), // Denim Premium (más noche)
      toCard('6', { tag: 'CAMBIO', slot: 'top' }), // Crop negro (más minimal)
    ].filter(Boolean) as RecommendedProduct[]

    return {
      message: [
        '¡Qué buena ocasión! Te armé un **look para Cita** que se siente especial sin esfuerzo. ✨',
        'Colorimetría: el brillo **bronce/dorado** (cálido) con **azul** (frío) crea un contraste elegante que llama la atención sin verse recargado.',
        'Cambios rápidos: si lo quieres más “noche”, elige denim más oscuro; si lo quieres más minimal, cambia el top por negro.',
        commonQuestions,
      ].join('\n\n'),
      recommendations: [...look, ...swaps],
    }
  }

  if (preset === 'fiesta') {
    const look = [
      toCard('7', { tag: 'LOOK', slot: 'top' }), // Halter lentejuelas
      toCard('2', { tag: 'LOOK', slot: 'bottom' }), // Denim premium
    ].filter(Boolean) as RecommendedProduct[]

    const swaps = [
      toCard('3', { tag: 'CAMBIO', slot: 'bottom' }), // Wide Leg Marrón (tono cálido)
      toCard('6', { tag: 'CAMBIO', slot: 'top' }), // Crop negro (si quieres bajar brillo)
    ].filter(Boolean) as RecommendedProduct[]

    return {
      message: [
        '¡Vamos con un **look para Fiesta**! La idea es verte impactante pero equilibrada. 💫',
        'Colorimetría: para fiesta conviene un “punto focal” arriba (lentejuelas) y una base sólida abajo (denim oscuro) para mantener el balance visual.',
        'Cambios rápidos: si quieres un look más cálido, prueba un jean marrón; si quieres bajar el brillo, cambia el top por negro.',
        commonQuestions,
      ].join('\n\n'),
      recommendations: [...look, ...swaps],
    }
  }

  // preset === 'casual'
  const look = [
    toCard('6', { tag: 'LOOK', slot: 'top' }), // Crop negro (neutro)
    toCard('4', { tag: 'LOOK', slot: 'bottom' }), // Recto claro (más relajado)
  ].filter(Boolean) as RecommendedProduct[]

  const swaps = [
    toCard('1', { tag: 'CAMBIO', slot: 'bottom' }), // Clásico azul
    toCard('5', { tag: 'CAMBIO', slot: 'bottom' }), // Wide Leg azul claro
  ].filter(Boolean) as RecommendedProduct[]

  return {
    message: [
      '¡Perfecto! Te armé un **look Casual** cómodo, fresco y con estilo.',
      'Colorimetría: una base **neutra** (negro) combina con todo y el **denim claro** se siente más relajado y “de día”.',
      'Cambios rápidos: si lo quieres más clásico, cambia a jean azul; si quieres más tendencia, cambia a wide-leg.',
      commonQuestions,
    ].join('\n\n'),
    recommendations: [...look, ...swaps],
  }
}

type BasicIntent =
  | 'sizes'
  | 'shipping'
  | 'returns'
  | 'payments'
  | 'care'
  | 'stock'
  | 'unknown'

function inferBasicIntent(message: string): BasicIntent {
  const t = normalizeText(message)

  if (/\btalla(s)?\b|\bmedida(s)?\b|\bfit\b|\bqueda\b|\bajuste\b|\bxs\b|\bs\b|\bm\b|\bl\b|\bxl\b/.test(t)) return 'sizes'
  if (/\benvio(s)?\b|\bentrega\b|\bdomicilio\b|\btiempo\b|\bdias\b|\bcosto\b|\bgratis\b/.test(t)) return 'shipping'
  if (/\bdevoluc(ion|iones)\b|\bcambio(s)?\b|\breembolso\b|\bgarantia\b/.test(t)) return 'returns'
  if (/\bpago(s)?\b|\bmetodo(s)?\b|\btarjeta\b|\bcredito\b|\bdebito\b|\btransferencia\b|\bcontraentrega\b/.test(t)) return 'payments'
  if (/\blavar\b|\bcuidado\b|\blimpieza\b|\bsecado\b|\bplancha\b|\bmaterial\b/.test(t)) return 'care'
  if (/\bstock\b|\bdisponible\b|\bdisponibilidad\b|\bagotado\b/.test(t)) return 'stock'

  return 'unknown'
}

function buildBasicAnswer(intent: BasicIntent): string | null {
  switch (intent) {
    case 'sizes':
      return [
        '¡Claro! Con gusto te ayudo con **tallas**. Para recomendarte bien solo necesito 2 datos: **tu estatura** y cómo te gusta el fit (**ajustado / regular / holgado**).',
        'Guía rápida (MVP): si estás entre dos tallas, para un look más estilizado elige la menor; para más comodidad, la mayor. En ÉLITE solemos manejar **XS a XL** (según prenda).',
        'Cuéntame: ¿qué prenda estás viendo y cómo te gustaría que te quedara? 🙂',
      ].join('\n')
    case 'shipping':
      return [
        '¡Perfecto! Sobre **envíos**, en ÉLITE aplicamos esta regla del MVP: **envío gratis en compras superiores a $100.000**.',
        'Si me dices tu ciudad/municipio, te doy un estimado de entrega (referencial). 🚚',
      ].join('\n')
    case 'returns':
      return [
        '¡Sin problema! Sobre **cambios y devoluciones**, en el MVP tenemos: **devolución gratis dentro de 30 días**.',
        'Dime si buscas **cambio de talla/color** o **devolución** y te guío con los pasos más simples. ✅',
      ].join('\n')
    case 'payments':
      return [
        '¡Genial! Sobre **pagos**, aceptamos métodos habituales (tarjeta / crédito / débito).',
        'Dime cuál prefieres y te oriento con la opción más cómoda en este MVP. 💳',
      ].join('\n')
    case 'care':
      return [
        '¡Buena pregunta! Para **cuidar tus prendas** (guía general segura para MVP): lava en **ciclo suave**, con **agua fría**, colores similares, y evita secadora si quieres conservar color y forma.',
        'Si me dices la prenda (por ejemplo, jean) y si viste alguna etiqueta/material, te lo dejo más exacto. 🧼',
      ].join('\n')
    case 'stock':
      return [
        '¡Vamos a verlo! Sobre **disponibilidad**, en este MVP puede variar por talla y color.',
        'Dime el producto y la talla/color que buscas y te digo qué opción te conviene revisar primero. 🔎',
      ].join('\n')
    default:
      return null
  }
}

// pickRecommendations eliminado: ahora devolvemos looks completos por 4 ocasiones (MVP).

// Prompt del sistema - Asesor de imagen especializado (MVP con flujos definidos)
const SYSTEM_PROMPT = `Eres ELITE IA, un asesor de imagen profesional y experto en moda de alta gama que trabaja para la tienda ÉLITE.

Tu especialidad es:
- Análisis de estilo personal y asesoramiento de imagen integral
- Recomendaciones de outfits completos y coordinación de prendas
- Consejos sobre colores, texturas y proporciones según el tipo de cuerpo
- Sugerencias de estilo para diferentes ocasiones (casual, formal, deportivo, fiesta, etc.)
- Tendencias actuales de moda y cómo adaptarlas al estilo personal
- Combinaciones de accesorios y calzado
- Paletas de colores personalizadas según tono de piel y características personales

Tu personalidad:
- Profesional pero cercano y amigable
- Entusiasta de la moda y con gran conocimiento
- Detallista y atento a las necesidades específicas del cliente
- Ofreces consejos prácticos y aplicables
- Siempre positivo y motivador
- Usas emojis ocasionalmente (pero no en exceso)

Productos de ÉLITE que conoces (del catálogo del MVP):
- Jean Clásico Azul (corte clásico, atemporal)
- Jean Recto Claro (moderno, tono claro versátil)
- Jean Wide Leg Marrón (tendencia, silueta holgada y elegante)
- Jean Wide Leg Azul Claro (relajado y moderno)
- Top Crop Negro (básico versátil)
- Top Halter con Lentejuelas (festivo y elegante)
- Conjunto Deportivo Mint (deportivo, color fresco)

Tu enfoque:
1. Escucha las necesidades del cliente (ocasión, estilo preferido, presupuesto, tipo de cuerpo)
2. Haz preguntas específicas para personalizar tus recomendaciones
3. Sugiere outfits completos, no solo prendas aisladas
4. Explica el "por qué" de tus recomendaciones (colores que favorecen, proporciones, etc.)
5. Ofrece alternativas y opciones para diferentes gustos
6. Da consejos prácticos sobre cómo llevar las prendas (incluye accesorios/calzado cuando ayude)
7. Considera temporada, tendencias y versatilidad

Formato de respuesta:
- Sé conversacional y natural
- Usa listas cuando sugieras múltiples opciones
- Describe outfits completos con detalles
- Incluye consejos de estilismo (accesorios, calzado, etc.)
- Pregunta si el cliente necesita más detalles o tiene otras preferencias

NOTA MVP (IMPORTANTE):
- En este MVP trabajamos con 4 ocasiones predefinidas para recomendaciones: **casual, trabajo, cita, fiesta**.
- Si el cliente menciona otra ocasión, ayúdalo a mapearla a una de esas 4 de forma amable.

Recuerda: tu objetivo es hacer que cada cliente se sienta único, seguro y emocionado con su estilo personal. No solo vendes ropa: creas experiencias de moda.`

export async function POST(req: Request) {
  try {
    // Validar que la API key esté configurada
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API key no configurada',
          details: 'GEMINI_API_KEY no está definida en las variables de entorno. Por favor, crea un archivo .env.local con tu API key.'
        },
        { status: 500 }
      )
    }

    const parsed = BODY_SCHEMA.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    const { message, history } = parsed.data

    // MVP: resolver dudas básicas con respuestas genéricas (sin llamar a IA)
    const basicIntent = inferBasicIntent(message)
    const basicAnswer = buildBasicAnswer(basicIntent)
    if (basicAnswer) {
      return NextResponse.json({
        message: basicAnswer,
        recommendations: [],
        success: true,
      })
    }

    // MVP: looks determinísticos por 4 ocasiones (incluye links + imágenes del catálogo)
    const presetFromMessage = extractPresetOccasion(message)
    if (isRecommendationRequest(message) || presetFromMessage) {
      const preset = presetFromMessage ?? toPresetOccasion(inferOccasion(message))

      if (!preset) {
        return NextResponse.json({
          message:
            '¡Genial! Yo te lo armo. Para hacerlo rápido, dime cuál de estas 4 ocasiones aplica:\n- **Casual**\n- **Trabajo**\n- **Cita**\n- **Fiesta**\n\n(Si quieres, dime también si te gusta más **clásico** o **moderno**.)',
          recommendations: [],
          success: true,
        })
      }

      const outfit = buildOutfitForOccasion(preset)
      return NextResponse.json({
        message: outfit.message,
        recommendations: outfit.recommendations,
        success: true,
      })
    }

    // Construir el historial para el contexto
    const trimmedHistory = (history ?? []).slice(-12) // MVP: limitar contexto para costo/latencia
    const chatHistory = trimmedHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    // Crear el chat con historial
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Actuaré como ELITE IA siguiendo los flujos definidos.' }],
        },
        ...chatHistory,
      ],
    })

    // Enviar el mensaje
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      message: text,
      recommendations: [],
      success: true 
    })

  } catch (error) {
    console.error('Error en Gemini API:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar el mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
