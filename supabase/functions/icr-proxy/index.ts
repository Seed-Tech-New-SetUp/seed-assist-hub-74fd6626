import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://seedglobaleducation.com/api/assist/in-country-representation';

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

    // Parse request body
    let body: Record<string, unknown> = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        // Body parsing failed
      }
    }

    // Determine the action from the body
    const action = (body.action as string) || 'list';

    let apiUrl: string;
    let fetchOptions: RequestInit;

    switch (action) {
      case 'create':
        apiUrl = `${BASE_URL}/create.php`;
        fetchOptions = {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportMonth: body.reportMonth,
            leadGeneration: body.leadGeneration,
            leadEngagement: body.leadEngagement,
            applicationFunnel: body.applicationFunnel,
          }),
        };
        break;

      case 'update':
        apiUrl = `${BASE_URL}/update.php`;
        fetchOptions = {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            report_id: body.report_id,
            reportMonth: body.reportMonth,
            leadGeneration: body.leadGeneration,
            leadEngagement: body.leadEngagement,
            applicationFunnel: body.applicationFunnel,
          }),
        };
        break;

      case 'delete':
        apiUrl = `${BASE_URL}/delete.php`;
        fetchOptions = {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            report_id: body.report_id,
          }),
        };
        break;

      case 'list':
      default:
        // Build the API URL with optional filters for listing
        const year = body.year as string | undefined;
        const month = body.month as string | undefined;
        
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        
        apiUrl = params.toString() ? `${BASE_URL}/?${params.toString()}` : `${BASE_URL}/`;
        fetchOptions = {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
        };
        break;
    }

    // Forward the request to the ICR API
    const response = await fetch(apiUrl, fetchOptions);

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
        action,
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
      JSON.stringify({ success: false, error: 'Failed to process ICR request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
