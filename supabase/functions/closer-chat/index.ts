// ====================================================================
// SUPABASE EDGE FUNCTION PARA GEMINI AI (closer-chat/index.ts)
// ====================================================================
// Asistente virtual en español basado en Google Gemini AI (estilo ChatGPT Pro).
// Características principales:
// 1. Detección dinámica de modelos de Google Gemini vía ListModels API.
// 2. Respuesta abierta a cualquier consulta general (conocimiento universal).
// 3. Conversación fluida de varios turnos (multi-turn history).
// 4. Análisis de imágenes multimodal (visión por computadora).
// 5. Sanitización y filtrado de respuestas para eliminar pensamientos internos (<think>).
// 6. Secret de API: closer_api
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
  system_instruction?: string;
}

function getSystemPrompt(): string {
  return `Eres un asistente virtual inteligente, atento, muy capaz y directo en español, al estilo ChatGPT Pro.
Tu objetivo es responder de manera directa, clara, concreta y útil a cualquier pregunta o consulta general del usuario (cultura general, ciencia, tecnología, consejos, redacción, resolución de problemas, etc.).

REGLAS DE RESPUESTA:
1. Responde SIEMPRE con la respuesta final directa y concreta.
2. Queda ESTRICTAMENTE PROHIBIDO mostrar razonamientos internos, borradores, pensamientos o etiquetas de análisis (como <think>, <thought>, <reasoning>, etc.).
3. Mantén un tono profesional, amable, claro y estructurado en español.`;
}

// Limpieza y sanitización estricta de las respuestas devueltas por el modelo
function sanitizeAIResponse(text: string): string {
  if (!text) return '';
  let clean = text;

  // 1. Eliminar bloques de pensamiento o borradores <thought> o <think> o <reasoning>
  clean = clean.replace(/<(thought|think|reasoning)[\s\S]*?<\/\1>/gi, '');

  // 2. Eliminar secciones de desglose de preguntas, borradores en inglés o razonamientos internos
  clean = clean.replace(/(question \d+:|knowledge areas:|steps \(|self-correction|drafting:|persona:|constraint:|\"como se hace|\"how to make)[\s\S]*?(?=\n\n[A-Z¡¿"']|Para |El |Hola |¡Hola |$)/gi, '');

  // 3. Eliminar prefijos de razonamiento o etiquetas internas
  clean = clean.replace(/(pensamiento|thought|reasoning|proceso de pensamiento):[\s\S]*?(?=\n\n|\n[A-Z¡¿"']|$)/gi, '');

  // 4. Filtrar líneas de metadatos o viñetas internas
  const lines = clean.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    if (trimmed.startsWith('*') && (
      lower.includes('user input') ||
      lower.includes('persona') ||
      lower.includes('constraint') ||
      lower.includes('thought') ||
      lower.includes('direct answer') ||
      lower.includes('reasoning') ||
      lower.includes('pensamiento') ||
      lower.includes('spanish')
    )) {
      return false;
    }
    return true;
  });

  clean = filtered.join('\n').trim();

  // 5. Eliminar bloques json u otros envolventes si existieran accidentalmente
  clean = clean.replace(/^```json[\s\S]*?```$/gi, '').trim();

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

  return foundModels;
}

serve(async (req: Request) => {
  // Manejo de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const apiKey = Deno.env.get('closer_api') || Deno.env.get('CLOSER_API');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'La API key closer_api no está configurada en las variables de entorno.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: RequestBody = {};
    try {
      body = await req.json();
    } catch (_e) {
      body = {};
    }

    const userQuery = (body.prompt || body.message || '').trim();
    const rawHistory = body.history || body.conversation_history || [];

    if (!userQuery && rawHistory.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Debes proporcionar un mensaje o prompt.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Estructurar historial para Gemini API
    const contents: GeminiContent[] = [];

    for (const item of rawHistory) {
      const role = (item.role === 'user' || item.role === 'human') ? 'user' : 'model';
      let itemText = item.text || item.content || '';
      if (!itemText && Array.isArray(item.parts)) {
        itemText = item.parts.map((p: any) => p.text || '').join(' ');
      }
      if (itemText) {
        contents.push({
          role,
          parts: [{ text: itemText }]
        });
      }
    }

    // Agregar el prompt actual del usuario si no está en el historial
    const lastContent = contents[contents.length - 1];
    if (userQuery && (!lastContent || lastContent.role !== 'user' || lastContent.parts[0]?.text !== userQuery)) {
      const userParts: GeminiPart[] = [{ text: userQuery }];

      // Manejo de imágenes (multimodal)
      const imgBase64 = body.image || body.image_base64;
      const imgMime = body.image_mime || 'image/jpeg';
      if (imgBase64) {
        const cleanBase64 = imgBase64.replace(/^data:image\/\w+;base64,/, '');
        userParts.unshift({
          inlineData: {
            mimeType: imgMime,
            data: cleanBase64
          }
        });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });
    }

    // Descubrir o seleccionar modelos
    const availableModels = await discoverAvailableGeminiModels(apiKey);
    const systemPrompt = getSystemPrompt();

    let finalResponseText = '';
    let usedModel = '';

    for (const modelName of availableModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const payload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            finalResponseText = candidateText;
            usedModel = modelName;
            break;
          }
        } else {
          // Reintentar sin systemInstruction por si el modelo no soporta la clave systemInstruction
          const fallbackPayload = {
            contents: [
              {
                role: 'user',
                parts: [{ text: `[INSTRUCCIÓN DE SISTEMA]\n${systemPrompt}\n[FIN INSTRUCCIÓN]\n\nPor favor responde a lo siguiente.` }]
              },
              ...contents
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          };

          const fallbackRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackPayload)
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              finalResponseText = candidateText;
              usedModel = modelName;
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`Error al consultar modelo ${modelName}:`, err);
      }
    }

    if (!finalResponseText) {
      return new Response(
        JSON.stringify({ error: 'No se pudo obtener una respuesta válida del servicio de IA.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanText = sanitizeAIResponse(finalResponseText);

    return new Response(
      JSON.stringify({
        response: cleanText,
        text: cleanText,
        model: usedModel
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Error interno en el servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
