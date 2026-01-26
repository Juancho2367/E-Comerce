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

const LOCAL_IMAGE_PRODUCTS = products
  .filter((p) => p.images?.some((img) => typeof img === 'string' && img.startsWith('/images/products/')))
  .map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.images.find((img) => img.startsWith('/images/products/'))!,
    url: `/productos/${p.id}`,
  }))

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
        'Sobre **tallas**, para que te quede perfecto necesito 2 datos: **tu estatura** y cómo te gusta el fit (ajustado/regular/holgado).',
        'Como guía rápida: si estás entre dos tallas, para un look más estilizado elige la menor; para comodidad, la mayor. En ÉLITE manejamos tallas comunes **XS a XL** (según prenda).',
        '¿Qué prenda estás viendo y cómo te gusta que te quede?',
      ].join('\n')
    case 'shipping':
      return [
        'Sobre **envíos**, en ÉLITE aplicamos esta regla del MVP: **envío gratis en compras superiores a $100.000**.',
        'Si me dices tu ciudad/municipio te confirmo un estimado de entrega (referencial).',
      ].join('\n')
    case 'returns':
      return [
        'Sobre **cambios y devoluciones**, en el MVP tenemos: **devolución gratis dentro de 30 días**.',
        'Cuéntame si buscas cambio de talla/color o devolución y te guío con los pasos.',
      ].join('\n')
    case 'payments':
      return [
        'Sobre **pagos**, aceptamos métodos habituales (tarjeta/crédito/débito).',
        'Si me dices cuál prefieres, te confirmo si está disponible en tu checkout (MVP).',
      ].join('\n')
    case 'care':
      return [
        'Sobre **cuidado de prendas**, recomendación general (segura para MVP): lavar en **ciclo suave**, con **agua fría**, colores similares, y evitar secadora si quieres conservar color/forma.',
        'Si me dices la prenda (ej. jean) y el material/etiqueta, te doy una guía más exacta.',
      ].join('\n')
    case 'stock':
      return [
        'Sobre **disponibilidad**, en este MVP la disponibilidad puede variar por talla/color.',
        'Dime el producto y la talla/color que buscas y te digo qué opción te conviene revisar primero.',
      ].join('\n')
    default:
      return null
  }
}

function pickRecommendations(occasion: Occasion): RecommendedProduct[] {
  if (!LOCAL_IMAGE_PRODUCTS.length) return []

  const ids = RECOMMENDATION_IDS_BY_OCCASION[occasion] ?? RECOMMENDATION_IDS_BY_OCCASION.desconocida
  const chosen = ids
    .map((id) => LOCAL_IMAGE_PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as RecommendedProduct[]

  // Fallback: si por cualquier razón no se encuentran IDs, devolver hasta 2 locales.
  if (!chosen.length) return LOCAL_IMAGE_PRODUCTS.slice(0, 2)

  return chosen.slice(0, 2)
}

// Prompt del sistema - Asesor de imagen especializado (MVP con flujos definidos)
const SYSTEM_PROMPT = `Eres ELITE IA, un asesor de imagen profesional de la tienda ÉLITE. Tu meta es ayudar al cliente a elegir prendas y armar outfits de forma rápida.

CATÁLOGO MVP DISPONIBLE (en esta tienda):
- Jean Clásico Azul ($1,299)
- Jean Denim Premium ($1,499)
- Jean Recto Claro ($1,199)

REGLAS GENERALES:
- Responde SIEMPRE en español.
- Sé conciso: máximo 2 párrafos + una lista corta si aplica.
- Haz 1-2 preguntas para personalizar cuando falte información crítica (ocasión, estilo, colores, talla).
- No inventes políticas: si preguntan por envíos/devoluciones, responde con lo disponible: envío gratis en compras superiores a $100.000 y devolución gratis dentro de 30 días.
- No pidas datos sensibles (tarjetas, documentos). No reveles llaves/API ni información interna.

FLUJOS (OBLIGATORIOS):
1) SALUDO / PRIMER CONTACTO
   - Si no conoces el nombre: pide el nombre y la ocasión.
   - Ejemplo: "¡Hola! ¿Cómo te llamas y para qué ocasión buscas tu outfit?"

2) RECOMENDACIÓN DE PRENDA / OUTFIT
   - Confirma la ocasión (cita, trabajo, fiesta, casual, formal, diario, gym) y el estilo (clásico/moderno/minimal).
   - Propón máximo 2 opciones del catálogo MVP, explicando 2 puntos clave (por qué funciona para la ocasión).
   - Cierra con 1 pregunta para ajustar (color preferido o talla).

3) SOLUCIÓN DE DUDAS (TALLAS / CUIDADO / ENVÍOS / DEVOLUCIONES)
   - Responde directo y ofrece un siguiente paso (qué dato necesitas o qué recomienda hacer).
   - Si no sabes algo, dilo y pide el dato mínimo para continuar.
`

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

    const occasion = inferOccasion(message)
    const shouldAttachRecommendations = isRecommendationRequest(message)
    const recommendations = shouldAttachRecommendations ? pickRecommendations(occasion) : []

    return NextResponse.json({ 
      message: text,
      recommendations,
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
