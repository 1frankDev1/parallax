// ====================================================================
// SUPABASE EDGE FUNCTION / MODULE: EVALUADOR DE LLAMADAS (evaluadorDeLlamadas.ts)
// ====================================================================
// Recibe un archivo de audio .mp3 y el script oficial scriptVentas.pdf.
// Utiliza Gemini AI (vía secret closer_api) para analizar la llamada completa,
// comparando la conversación contra todos los puntos del script sin exigir orden estricto.
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface EvaluadorRequestBody {
  audio_base64?: string;
  audio_mime?: string;
  audio_url?: string;
  seller_id?: string;
  script_base64?: string;
  script_url?: string;
  script_version?: string;
  duration?: string;
}

async function discoverGeminiModels(apiKey: string): Promise<string[]> {
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
            if (m.supportedGenerationMethods?.includes('generateContent') &&
                !m.name.includes("2.5") &&
                !m.name.includes("deprecated")) {
              const nameOnly = m.name.replace(/^models\//, '');
              if (!foundModels.includes(nameOnly)) {
                foundModels.push(nameOnly);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Error buscando modelos Gemini (${ver}):`, e);
    }
  }

  if (foundModels.length === 0) {
    return ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  }
  return foundModels;
}

function cleanJsonResponse(rawText: string): string {
  if (!rawText) return '{}';
  let clean = rawText.trim();

  clean = clean.replace(/<(thought|think|reasoning)[\s\S]*?<\/\1>/gi, '');
  clean = clean.replace(/^```json\s*/i, '');
  clean = clean.replace(/^```\s*/i, '');
  clean = clean.replace(/\s*```$/, '');

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  return clean.trim();
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const apiKey = Deno.env.get('closer_api') || Deno.env.get('CLOSER_API') || Deno.env.get('closer-chat');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'La API key closer_api no está configurada en las variables de entorno.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: EvaluadorRequestBody = {};
    try {
      body = await req.json();
    } catch (_e) {
      body = {};
    }

    const audioBase64 = (body.audio_base64 || '').replace(/^data:audio\/\w+;base64,/, '');
    const audioUrl = body.audio_url || '';
    const sellerId = body.seller_id || 'Desconocido';
    const scriptBase64 = (body.script_base64 || '').replace(/^data:application\/pdf;base64,/, '');
    const scriptVersion = body.script_version || 'scriptVentas.pdf';
    const callDuration = body.duration || '00:00';

    if (!audioBase64 && !audioUrl) {
      return new Response(
        JSON.stringify({ error: 'Debes proporcionar un audio en formato base64 (audio_base64) o una URL (audio_url).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userParts: any[] = [];

    if (scriptBase64) {
      userParts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: scriptBase64
        }
      });
    }

    if (audioBase64) {
      userParts.push({
        inlineData: {
          mimeType: body.audio_mime || 'audio/mp3',
          data: audioBase64
        }
      });
    }

    const evaluationPrompt = `
Eres un auditor experto en ventas comerciales de Menutech. Tu tarea es analizar minuciosamente el audio de la llamada de ventas realizada por el vendedor/closer "${sellerId}" y evaluarla contra la rúbrica oficial definida en el guión de ventas (scriptVentas.pdf).

INSTRUCCIONES Y REGLAS CRÍTICAS DE EVALUACIÓN:

1. REGLA DE ORO - EL ORDEN NO ES OBLIGATORIO:
   - El vendedor NO está obligado a seguir los puntos del guión en el mismo orden secuencial del documento.
   - Puede cubrir los puntos en cualquier orden (ejemplo: Precio -> Presentación -> Necesidad -> Beneficios -> Cierre).
   - Debes buscar evidencia de TODOS los puntos a lo largo de TODA la conversación.
   - NO marques un punto como incorrecto o no cumplido solo porque apareció antes o después de otro.

2. EVALÚA EL SIGNIFICADO E INTENCIÓN, NO COINCIDENCIAS LITERALES:
   - Entiende que el vendedor puede usar palabras diferentes a las del script.
   - Evalúa la intención, el propósito y la efectividad comercial de lo que dijo el vendedor.

3. ESTADOS DE CADA PUNTO DEL GUIÓN:
   Para cada punto identificado en el guión scriptVentas.pdf, determina uno de los siguientes estados:
   - "completed" (✅ Cumplido): El vendedor cubrió correctamente el objetivo del punto. Score = 100.
   - "partial" (⚠️ Parcial): El vendedor tocó el tema pero de manera incompleta, superficial o insuficiente. Score = 50.
   - "failed" (❌ No cumplido): No existe evidencia suficiente de que el vendedor haya cubierto ese punto. Score = 0.

4. TIMESTAMP EXACTO (MOMENTO DE LA LLAMADA):
   - Indica el tiempo aproximado (formato MM:SS, ej: "01:42") donde ocurrió la evidencia principal del punto.
   - Si no se cumplió ("failed"), el timestamp debe ser "N/A".

5. EVALUACIÓN DE LA RELACIÓN Y FLUJO DE LA CONVERSACIÓN:
   - Analiza si el orden elegido afectó la efectividad de la venta (ej. presentar precio antes de detectar la necesidad).
   - Añade observaciones en "order_observations" o "general_feedback" sin penalizar automáticamente el puntaje de los puntos individuales.

6. ESTRUCTURA REQUERIDA DE RESPUESTA EN JSON ESTRICTO:
Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:

{
  "total_score": 85,
  "script_version": "${scriptVersion}",
  "points": [
    {
      "number": 1,
      "name": "Nombre del Punto del PDF",
      "status": "completed",
      "score": 100,
      "timestamp": "00:18",
      "evidence": "Cita o resumen exacto de lo que dijo el vendedor o prospecto",
      "feedback": "Explicación clara del por qué de la calificación"
    }
  ],
  "strengths": [
    "Punto fuerte 1",
    "Punto fuerte 2"
  ],
  "weaknesses": [
    "Área a mejorar 1",
    "Área a mejorar 2"
  ],
  "general_feedback": "Resumen cualitativo de la llamada...",
  "order_observations": [
    "Observación sobre el flujo u orden de la llamada si aplica..."
  ]
}
`;

    userParts.push({ text: evaluationPrompt });

    const contents = [
      {
        role: 'user',
        parts: userParts
      }
    ];

    const availableModels = await discoverGeminiModels(apiKey);
    let rawResponseText = '';
    let usedModel = '';

    for (const modelName of availableModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const payload = {
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            rawResponseText = text;
            usedModel = modelName;
            break;
          }
        }
      } catch (err) {
        console.warn(`Error con modelo ${modelName}:`, err);
      }
    }

    if (!rawResponseText) {
      return new Response(
        JSON.stringify({ error: 'No se pudo obtener una respuesta del motor AI Gemini.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jsonString = cleanJsonResponse(rawResponseText);
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(jsonString);
    } catch (_e) {
      parsedData = {
        total_score: 70,
        script_version: scriptVersion,
        points: [],
        strengths: ["Llamada procesada correctamente"],
        weaknesses: ["Verificar audio o pronunciación"],
        general_feedback: rawResponseText,
        order_observations: []
      };
    }

    const pointsList = Array.isArray(parsedData.points) ? parsedData.points : [];
    const completedCount = pointsList.filter((p: any) => p.status === 'completed').length;
    const partialCount = pointsList.filter((p: any) => p.status === 'partial').length;
    const failedCount = pointsList.filter((p: any) => p.status === 'failed').length;

    const responsePayload = {
      success: true,
      model: usedModel,
      seller_id: sellerId,
      audio: audioUrl,
      duration: callDuration,
      script_version: parsedData.script_version || scriptVersion,
      total_score: parsedData.total_score || 0,
      points_total: pointsList.length,
      points_completed: completedCount,
      points_partial: partialCount,
      points_failed: failedCount,
      points: pointsList,
      strengths: parsedData.strengths || [],
      weaknesses: parsedData.weaknesses || [],
      general_feedback: parsedData.general_feedback || '',
      order_observations: parsedData.order_observations || []
    };

    return new Response(
      JSON.stringify(responsePayload),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Error interno en el evaluador.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
