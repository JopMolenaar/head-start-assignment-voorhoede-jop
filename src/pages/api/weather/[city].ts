export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {

  const runtimeKey =
    'env' in context
      ? (context.env as { VISUALCROSSING_KEY?: string }).VISUALCROSSING_KEY
      : undefined;
  const localKey = import.meta.env.VISUALCROSSING_KEY;
  const API_KEY = runtimeKey ?? localKey;
  
  const city = context.params.city as string;

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${API_KEY}&include=days,current&iconSet=icons2`;  
 
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const details = await response.text().catch(() => response.statusText);
      return new Response(JSON.stringify({ error: 'Bad Request', details }), {
        status: response.status || 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unable to fetch weather data', details: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};