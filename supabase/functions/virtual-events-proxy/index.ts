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
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const eventId = url.searchParams.get('id');

    let apiUrl = 'https://seedglobaleducation.com/api/assist/virtual-event/overview.php';

    // Route based on action
    if (action === 'masterclass') {
      apiUrl = 'https://seedglobaleducation.com/api/assist/virtual-event/masterclass';
    } else if (action === 'meetup' || action === 'meetups') {
      apiUrl = 'https://seedglobaleducation.com/api/assist/virtual-event/meetup';
    } else if (action === 'download-meetup' && eventId) {
      // Handle meetup report download
      apiUrl = `https://seedglobaleducation.com/api/assist/virtual-event/meetup/reports.php?id=${eventId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const blob = await response.blob();
      
      return new Response(blob, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="meetup-report-${eventId}.xlsx"`,
        },
      });
    } else if (action === 'download' && eventId) {
      // Handle masterclass report download
      apiUrl = `https://seedglobaleducation.com/api/assist/virtual-event/masterclass/report.php?id=${eventId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const blob = await response.blob();
      
      return new Response(blob, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="virtual-event-report-${eventId}.xlsx"`,
        },
      });
    }

    // Forward the request to the appropriate API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    // Safe JSON parsing - handle non-JSON responses gracefully
    const contentType = response.headers.get('Content-Type') || '';
    const rawText = await response.text();
    
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Virtual Events Proxy: Non-JSON response', {
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
    console.error('Virtual Events Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Virtual Events data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});