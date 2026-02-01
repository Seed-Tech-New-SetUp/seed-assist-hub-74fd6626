import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const action = url.searchParams.get('action') || 'list';

    let apiUrl: string;
    let method = 'GET';
    let body: string | undefined;

    if (action === 'list' || action === 'applicants') {
      // Get applicants list
      apiUrl = 'https://seedglobaleducation.com/api/assist/scholarship/applicants.php';
    } else if (action === 'profile') {
      // Get individual applicant profile
      const contactId = url.searchParams.get('contact_id');
      if (!contactId) {
        return new Response(
          JSON.stringify({ success: false, error: 'contact_id parameter required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      apiUrl = `https://seedglobaleducation.com/api/assist/scholarship/profile.php?contact_id=${contactId}`;
    } else if (action === 'status_assignment') {
      // Update applicant status (POST)
      apiUrl = 'https://seedglobaleducation.com/api/assist/scholarship/status_assignment.php';
      method = 'POST';
      
      if (req.method !== 'POST') {
        return new Response(
          JSON.stringify({ success: false, error: 'POST method required for status_assignment' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        body = await req.text();
      } catch (e) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scholarship Proxy: ${method} ${apiUrl}`);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      fetchOptions.body = body;
    }

    const response = await fetch(apiUrl, fetchOptions);
    
    // Safe JSON parsing - handle non-JSON responses gracefully
    const contentType = response.headers.get('Content-Type') || '';
    const rawText = await response.text();
    
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Scholarship Proxy: Non-JSON response', {
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
    console.error('Scholarship Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scholarship data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});