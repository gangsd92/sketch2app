
export const MODELS = [
  { value: 'gemini-2.0-flash-exp', label: 'gemini-2.0-flash-exp' },
  { value: 'gemini-1.5-flash', label: 'gemini-1.5-flash' },
  { value: 'gemini-1.5-pro', label: 'gemini-1.5-pro' },
];

export interface AnalyzeResult {
  reasoning: string;
  title: string;
  summary: string;
  pages: {
    name: string;
    route: string;
    components: {
      name: string;
      role: string;
      details: string;
    }[];
  }[];
  theme: string;
  interactions: string[];
}

export const ANALYZE_SCHEMA = {
  type: 'object',
  properties: {
    reasoning: { type: 'string', description: 'A short narration of what you see and infer (2-4 sentences).' },
    title: { type: 'string' },
    summary: { type: 'string' },
    pages: {
      type: 'array',
      description: 'The different screens or views identified in the sketch (sitemap).',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the page (e.g. Login, Dashboard).' },
          route: { type: 'string', description: 'The internal route path (e.g. /login, /home).' },
          components: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                details: { type: 'string' }
              },
              required: ['name', 'role', 'details']
            }
          }
        },
        required: ['name', 'route', 'components']
      }
    },
    theme: { type: 'string', description: 'Style direction: minimal / playful / corporate / dark / etc.' },
    interactions: { type: 'array', items: { type: 'string' } }
  },
  required: ['reasoning', 'title', 'summary', 'pages', 'theme', 'interactions']
};

export async function callGemini({
  apiKey,
  model,
  parts,
  jsonSchema,
  temperature = 0.5
}: {
  apiKey: string;
  model: string;
  parts: any[];
  jsonSchema?: any;
  temperature?: number;
}) {
  if (!apiKey) throw new Error('Add your Gemini API key');

  const body: any = {
    contents: [{ parts }],
    generationConfig: { temperature, maxOutputTokens: 8192 }
  };

  if (jsonSchema) {
    body.generationConfig.responseMimeType = 'application/json';
    body.generationConfig.responseSchema = jsonSchema;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`HTTP ${r.status}: ${txt.slice(0, 240)}`);
  }

  const j = await r.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || '';
  
  if (!text) throw new Error('Empty response from model');
  return text;
}

export function stripHtml(text: string) {
  let html = text.trim();
  html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const i = html.search(/<!DOCTYPE|<html/i);
  if (i > 0) html = html.slice(i);
  return html;
}
