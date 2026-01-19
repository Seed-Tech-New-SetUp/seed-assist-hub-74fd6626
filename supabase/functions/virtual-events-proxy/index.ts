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
    } else if (action === 'meetups') {
      apiUrl = 'https://seedglobaleducation.com/api/assist/virtual-event/meetups';
    } else if (action === 'download' && eventId) {
      // Handle masterclass report download
      apiUrl = `https://seedglobaleducation.com/api/assist/virtual-event/masterclass/report?id=${eventId}`;
      
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

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Virtual Events Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch Virtual Events data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});