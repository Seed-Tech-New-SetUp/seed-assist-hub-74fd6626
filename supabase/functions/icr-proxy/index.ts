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

    // Parse request body for filter parameters
    let year: string | null = null;
    let month: string | null = null;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        year = body.year || null;
        month = body.month || null;
      } catch {
        // Body parsing failed, continue without filters
      }
    }

    // Build the API URL with optional filters
    let apiUrl = 'https://seedglobaleducation.com/api/assist/icr/reports';
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    // Forward the request to the ICR API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // IMPORTANT: upstream may return HTML (e.g., auth/WAF page) which would break response.json().
    const contentType = response.headers.get('content-type') || 'unknown';
    const rawText = await response.text();

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      const snippet = rawText.slice(0, 600);
      console.error('ICR Proxy Upstream Non-JSON Response', {
        apiUrl,
        status: response.status,
        contentType,
        snippet,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Upstream returned non-JSON response',
          upstream: {
            url: apiUrl,
            status: response.status,
            contentType,
            body_snippet: snippet,
          },
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ICR Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch ICR reports' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
