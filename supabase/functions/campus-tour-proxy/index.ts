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

    // Check for event ID in query params (for report download)
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (eventId) {
      // Download report for specific event
      const response = await fetch(
        `https://seedglobaleducation.com/api/assist/in-person-event/campus-tour/reports.php?id=${eventId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
          },
        }
      );

      if (!response.ok) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to download report' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the file as array buffer and return as blob
      const fileBuffer = await response.arrayBuffer();
      
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="campus_tour_report_${eventId}.xlsx"`,
        },
      });
    }

    // Forward the request to the Campus Tour API (list events)
    const response = await fetch('https://seedglobaleducation.com/api/assist/in-person-event/campus-tour/', {
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
      console.error('Campus Tour Proxy: Non-JSON response', {
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
    console.error('Campus Tour Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Campus Tour data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
