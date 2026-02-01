import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward the request to the BSF API
    const response = await fetch('https://seedglobaleducation.com/api/assist/in-person-event/bsf', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // Safe JSON parsing - handle non-JSON responses gracefully
    const contentType = response.headers.get('Content-Type') || '';
    const rawText = await response.text();
    
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('BSF Proxy: Non-JSON response', {
        status: response.status,
        contentType,
        snippet: rawText.slice(0, 500),
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Backend returned non-JSON response',
          status: response.status,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('BSF Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch BSF events';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
