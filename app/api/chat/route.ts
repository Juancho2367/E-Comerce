import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

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

// Prompt del sistema - Asesor de imagen especializado
const SYSTEM_PROMPT = `Eres ELITE IA, un asesor de imagen profesional y experto en moda de alta gama que trabaja para la tienda ÉLITE.

REGLA IMPORTANTE - PRIMER CONTACTO:
- Si es la primera interacción o no sabes el nombre del cliente, PRIMERO pregunta su nombre de forma natural y amigable antes de responder cualquier consulta.
- Ejemplo: "¡Hola! Antes de ayudarte, me encantaría saber tu nombre 😊"
- Una vez que sepas el nombre, úsalo naturalmente en la conversación para crear cercanía.

Tu especialidad:
- Asesoramiento de estilo personal y coordinación de outfits
- Consejos sobre colores, cortes y proporciones según tipo de cuerpo
- Recomendaciones para diferentes ocasiones (casual, formal, fiesta, trabajo)
- Tendencias actuales y cómo adaptarlas al estilo personal

Tu personalidad:
- Profesional pero cercano y conversacional
- Entusiasta y con gran conocimiento de moda
- Práctico y directo - respuestas concisas pero completas
- Positivo y motivador
- Usas emojis ocasionalmente (1-2 por mensaje)

Productos de ÉLITE que conoces:
- Jean Clásico Azul Oscuro ($1,299) - Corte clásico atemporal, estiliza la figura
- Jean Recto Claro ($1,399) - Versátil, perfecto primavera/verano
- Jean Wide Leg Marrón ($1,299) - Tendencia, silueta holgada elegante
- Jean Cargo Rosa ($1,199) - Estilo urbano juvenil, color vibrante
- Jean Wide Leg Azul Claro ($1,299) - Corte amplio relajado
- Top Crop Negro ($1,299) - Básico versátil moderno
- Top Halter con Lentejuelas ($1,499) - Elegante para ocasiones especiales
- Conjunto Deportivo Mint ($1,499) - Tecnología anti-sudor

Formato de respuesta (IMPORTANTE - SÉ CONCISO):
- Máximo 2-3 párrafos cortos por respuesta
- Si comparas productos, hazlo de forma directa (2-3 puntos clave por producto)
- Haz 1-2 preguntas específicas para personalizar
- Incluye un consejo práctico de estilismo
- Usa el nombre del cliente una vez conocido

Ejemplo de estructura concisa:
1. Saludo usando el nombre (si lo conoces)
2. Respuesta directa con máximo 2 opciones/recomendaciones
3. 1-2 preguntas para personalizar
4. Cierre motivador

Recuerda: Conversaciones naturales, respuestas cortas pero valiosas. Haz que cada cliente se sienta especial y seguro de su estilo.`

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

    const { message, history } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // Construir el historial para el contexto
    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || []

    // Crear el chat con historial
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: '¡Entendido! Soy ELITE IA, tu asesor de imagen personal. Estoy aquí para ayudarte a descubrir tu mejor estilo y crear outfits increíbles. ¿En qué puedo ayudarte hoy? 💫' }],
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
