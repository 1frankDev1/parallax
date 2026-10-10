// ====================================================================
// SUPABASE EDGE FUNCTION PARA GEMINI AI (closer-chat/index.ts)
// ====================================================================
// Asistente virtual en español basado en Google Gemini AI (estilo ChatGPT Pro / Compañero inteligente).
// Características principales:
// 1. Detección dinámica de modelos de Google Gemini vía ListModels API.
// 2. Respuesta abierta a cualquier consulta general (conocimiento universal).
// 3. Conversación fluida de varios turnos (multi-turn history).
// 4. Análisis de imágenes multimodal (visión por computadora).
// 5. Sanitización y filtrado de respuestas para eliminar pensamientos internos (<think>, "User says", "Intent", etc.).
// 6. Secret de API: closer_api / CLOSER_API / GEMINI_API_KEY / Spirit
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface RequestBody {
  prompt?: string;
  message?: string;
  history?: Array<{ role: string; content?: string; text?: string; parts?: any[] }>;
  conversation_history?: Array<{ role: string; content?: string; text?: string; parts?: any[] }>;
  image?: string;
  image_url?: string;
  image_base64?: string;
  image_mime?: string;
  is_proactive?: boolean;
  is_admin?: boolean;
  db_context?: string;
}

// Limpieza y sanitización estricta de las respuestas devueltas por el modelo
function sanitizeAIResponse(text: string): string {
  if (!text) return '';
  let clean = text;

  // 1. Eliminar bloques de pensamiento o borradores <thought>, <think> o <reasoning>
  clean = clean.replace(/<(thought|think|reasoning)[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/<(thought|think|reasoning)>[\s\S]*/gi, '');

  // 2. Eliminar secciones de desgloses de intenciones o borradores estilo "question 1:", etc.
  clean = clean.replace(/(question \d+:|knowledge areas:|steps \(|self-correction|drafting:|persona:|constraint:|\"como se hace|\"how to make)[\s\S]*?(?=\n\n[A-Z¡¿"']|Para |El |Hola |¡Hola |$)/gi, '');

  // 3. Eliminar prefijos de razonamiento o etiquetas internas
  clean = clean.replace(/(pensamiento|thought|reasoning|proceso de pensamiento):[\s\S]*?(?=\n\n|\n[A-Z¡¿"']|$)/gi, '');

  // 4. Filtrar líneas de metadatos o viñetas internas de análisis
  const lines = clean.split('\n');
  const filtered: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // Si la línea es una viñeta con clave de pensamiento interna
    if ((trimmed.startsWith('*') || trimmed.startsWith('-')) && (
      lower.includes('user input') ||
      lower.includes('user says') ||
      lower.includes('intent') ||
      lower.includes('persona') ||
      lower.includes('constraint') ||
      lower.includes('thought') ||
      lower.includes('direct answer') ||
      lower.includes('reasoning') ||
      lower.includes('pensamiento') ||
      lower.includes('spanish') ||
      lower.includes('objective') ||
      lower.includes('greeting') ||
      lower.includes('offer assistance') ||
      lower.includes('role:') ||
      lower.includes('standard greeting')
    )) {
      continue;
    }

    // Si la línea empieza con una viñeta y contiene la respuesta útil
    if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      const trimmedContent = trimmed.replace(/^[\*\-]\s*/, '');
      filtered.push(trimmedContent);
    } else {
      filtered.push(line);
    }
  }

  clean = filtered.join('\n').trim();
  clean = clean.replace(/^```json[\s\S]*?```$/gi, '').trim();

  // Quitar comillas que envuelven la respuesta final si existen
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith('“') && clean.endsWith('”')) || (clean.startsWith('¡') && clean.endsWith('"'))) {
    clean = clean.replace(/^["“]/, '').replace(/["”]$/, '').trim();
  }

  return clean;
}

// Descubrimiento dinámico de modelos disponibles vía ListModels API
async function discoverAvailableGeminiModels(apiKey: string): Promise<string[]> {
  const versions = ['v1beta', 'v1'];
  const foundModels: string[] = [];

  for (const ver of versions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          for (const m of data.models) {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent') && !m.name.includes("2.5") && !m.name.includes("deprecated")) {
              const nameOnly = m.name.replace(/^models\//, '');
              if (!foundModels.includes(nameOnly)) {
                foundModels.push(nameOnly);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Error descubriendo modelos en versión ${ver}:`, e);
    }
  }

  if (foundModels.length === 0) {
    return [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
  }

  // Ordenar priorizando modelos flash rápidos
  foundModels.sort((a, b) => {
    const aRank = a.includes("2.0-flash") ? 0 : a.includes("1.5-flash") ? 1 : 2;
    const bRank = b.includes("2.0-flash") ? 0 : b.includes("1.5-flash") ? 1 : 2;
    return aRank - bRank;
  });

  return foundModels;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const {
      prompt,
      message,
      history,
      conversation_history,
      image,
      image_url,
      image_base64,
      image_mime = 'image/jpeg',
      is_proactive = false
    } = body;

    if (is_proactive) {
      return new Response(JSON.stringify({ should_notify: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userPrompt = (prompt || message || '').trim();
    const historyInput = history || conversation_history || [];

    const apiKey = (
      Deno.env.get('closer_api') ||
      Deno.env.get('CLOSER_API') ||
      Deno.env.get('Spirit') ||
      Deno.env.get('GEMINI_API_KEY') ||
      ''
    ).trim();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'No se encontró la API Key de Gemini en las variables del servidor (closer_api / CLOSER_API).'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userPrompt && !image && !image_url && !image_base64 && historyInput.length === 0) {
      return new Response(
        JSON.stringify({
          response: '¡Hola! ¿En qué te puedo ayudar hoy?',
          text: '¡Hola! ¿En qué te puedo ayudar hoy?',
          reply: '¡Hola! ¿En qué te puedo ayudar hoy?'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const candidateModels = await discoverAvailableGeminiModels(apiKey);
    const contents: GeminiContent[] = [];

    // Sanitizar historial de conversación asegurando alternancia de roles (user / model)
    if (Array.isArray(historyInput) && historyInput.length > 0) {
      for (const turn of historyInput) {
        if (!turn || typeof turn !== 'object') continue;
        const role = turn.role === 'model' || turn.role === 'assistant' || turn.role === 'bot' ? 'model' : 'user';
        let parts: GeminiPart[] = [];

        if (Array.isArray(turn.parts)) {
          parts = turn.parts;
        } else if (typeof turn.content === 'string') {
          parts = [{ text: turn.content }];
        } else if (typeof turn.text === 'string') {
          parts = [{ text: turn.text }];
        }

        const validParts = parts.filter(p => p && (p.text !== undefined || p.inlineData !== undefined));
        if (validParts.length === 0) continue;

        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push(...validParts);
        } else {
          contents.push({ role, parts: [...validParts] });
        }
      }
    }

    // Preparar el turno actual
    const currentParts: GeminiPart[] = [];
    const rawImageData = image_base64 || image || image_url;

    if (rawImageData && typeof rawImageData === 'string') {
      let mimeType = image_mime || 'image/jpeg';
      let cleanBase64 = rawImageData;

      if (rawImageData.includes('base64,')) {
        mimeType = rawImageData.substring(rawImageData.indexOf(':') + 1, rawImageData.indexOf(';')) || mimeType;
        cleanBase64 = rawImageData.split(',')[1];
      }

      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      });
    }

    if (userPrompt) {
      currentParts.push({ text: userPrompt });
    }

    if (currentParts.length > 0) {
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts.push(...currentParts);
      } else {
        contents.push({ role: 'user', parts: currentParts });
      }
    }

    const systemInstruction = {
      parts: [
        {
          text: `Eres una Inteligencia Artificial extraordinariamente inteligente, capaz, brillante, alegre, empática y atenta (al estilo ChatGPT Pro / un compañero inteligente y cercano). No tienes nombre a menos que el usuario prefiera darte uno.
Tienes conocimientos amplios y profundos sobre programación, matemáticas, física, tecnología, cocina, ciencias, historia, filosofía, arte, cine, música, desarrollo web, pasatiempos, ventas, negocios, cartas/TCGs y conversación general.

REGLAS ABSOLUTAS E IMPERATIVAS:
1. Hablas SIEMPRE Y ÚNICAMENTE en español de forma natural, cálida, cercana, fluida y conversacional.
2. Queda STRICTAMENTE PROHIBIDO incluir pensamientos internos, notas de razonamiento, desgloses del mensaje del usuario (ejemplo: "User says", "Intent", "Objective", "Role", "Greeting"), traducciones al inglés, borradores de pasos, desgloses de preguntas o metacomentarios.
3. ENTREGABLE FINAL DIRECTO:
   - Responde SIEMPRE DIRECTAMENTE al usuario con tu mensaje final en español, sin preámbulos sobre lo que estás pensando o analizando.
4. ESTILO CONVERSACIONAL Y FLUIDO (ESTILO COMPAÑERO / CHATGPT PRO):
   - Sé siempre conversacional, empático y cercano, como si estuvieras platicando con un amigo o compañero.
   - Ante preguntas abiertas, dudas generales o temas amplios, responde con claridad e interactúa de manera amigable.
   - Da respuestas precisas, útiles y de alta calidad intelectual a cualquier consulta.
5. ACCIONES Y CÁLCULOS DIRECTOS:
   - Si el usuario te realiza un cálculo simple, o hace una pregunta puntual con respuesta directa, responde con precisión de forma clara y con un tono amigable.
6. ANÁLISIS DE IMÁGENES Y VISIÓN:
   - Si el usuario adjunta o envía una imagen, examínala atentamente con alta precisión.
   - Detecta qué hay en la imagen (cartas, objetos, texto, lugares, personas, documentos, productos) y conversa de manera amigable e inteligente sobre ella, respondiendo a cualquier pregunta o curiosidad que el usuario tenga basándote en la imagen.`
        }
      ]
    };

    let geminiRes: Response | null = null;
    let aiData: any = null;
    let lastApiError: string = '';

    for (const modelName of candidateModels) {
      const apiVersion = 'v1beta';
      const geminiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

      const generationConfig: Record<string, any> = {
        temperature: 0.7,
        maxOutputTokens: 2048
      };

      try {
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction,
            contents,
            generationConfig
          })
        });

        const data = await res.json();
        if (res.ok && data.candidates && data.candidates.length > 0) {
          geminiRes = res;
          aiData = data;
          break;
        } else if (data.error && data.error.message) {
          lastApiError = `[${modelName}] ${data.error.message}`;
          console.warn(`Intento fallido con modelo ${modelName}:`, data.error.message);
        }
      } catch (e: any) {
        lastApiError = `[${modelName}] ${e.message}`;
        console.warn(`Excepción llamando a ${modelName}:`, e);
      }
    }

    if (!geminiRes || !aiData) {
      return new Response(
        JSON.stringify({
          error: `Ocurrió un inconveniente de comunicación con el servicio de IA. Detalle: ${lastApiError || 'Sin respuesta de modelos.'}`
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const candidate = aiData.candidates?.[0];
    const resParts = candidate?.content?.parts || [];
    let rawReply = '';

    for (const part of resParts) {
      if (part.text) rawReply += part.text;
    }

    const cleanReply = sanitizeAIResponse(rawReply);

    return new Response(
      JSON.stringify({
        response: cleanReply || 'No pude generar una respuesta clara en este momento.',
        text: cleanReply || 'No pude generar una respuesta clara en este momento.',
        reply: cleanReply || 'No pude generar una respuesta clara en este momento.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Error interno en la Edge Function: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
