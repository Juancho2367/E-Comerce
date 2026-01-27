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
  const commonQuestions = '¿Prefieres un look más **ajustado** o más **holgado** y qué talla usas normalmente (XS–XL)?'

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
        '**Ocasión: Trabajo (look recomendado)**',
        'Colorimetría y ocasión: el **negro** es neutro y elegante, y el **denim azul oscuro** funciona como base fría/neutral que se ve profesional y estiliza.',
        'Si quieres ajustar el look con lo que hay en la tienda: cambia el jean por una opción más clara (más casual) o mantén el oscuro (más formal).',
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
        '**Ocasión: Cita (look recomendado)**',
        'Colorimetría y ocasión: el brillo **bronce/dorado** (cálido) con **azul** (frío) crea un contraste equilibrado que llama la atención sin verse recargado.',
        'Cambios rápidos con el catálogo: si quieres algo más “noche”, cambia a denim más oscuro; si quieres algo más minimal, cambia el top por negro.',
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
        '**Ocasión: Fiesta (look recomendado)**',
        'Colorimetría y ocasión: para fiesta conviene un “punto focal” arriba (lentejuelas) y una base sólida abajo (denim oscuro) para mantener balance visual.',
        'Cambios rápidos con el catálogo: si quieres un look más cálido, prueba un jean marrón; si quieres bajar el brillo, cambia el top por negro.',
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
      '**Ocasión: Casual (look recomendado)**',
      'Colorimetría y ocasión: una base **neutra** (negro) combina con todo y el **denim claro** da sensación más fresca/relajada (ideal día).',
      'Cambios rápidos con el catálogo: si quieres más clásico, cambia a jean azul; si quieres más tendencia, cambia a wide-leg.',
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

// pickRecommendations eliminado: ahora devolvemos looks completos por 4 ocasiones (MVP).

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
   - SOLO hay 4 ocasiones predefinidas: cita, trabajo, fiesta, casual.
   - Si el usuario no indica una, pregunta cuál de las 4 aplica.
   - Basarte en principios simples de colorimetría: neutrales (negro/azul) para trabajo, contraste cálido-frío (dorado+azul) para cita, foco visual para fiesta, frescura/relajo para casual.
   - Propón un look (top + bottom) y ofrece 1-2 cambios posibles con prendas del catálogo.

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

    // MVP: looks determinísticos por 4 ocasiones (incluye links + imágenes del catálogo)
    const presetFromMessage = extractPresetOccasion(message)
    if (isRecommendationRequest(message) || presetFromMessage) {
      const preset = presetFromMessage ?? toPresetOccasion(inferOccasion(message))

      if (!preset) {
        return NextResponse.json({
          message:
            'Perfecto, puedo armarte un look. ¿Para cuál de estas 4 ocasiones lo necesitas?\n- **Casual**\n- **Trabajo**\n- **Cita**\n- **Fiesta**',
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
