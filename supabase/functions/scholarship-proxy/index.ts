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
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Scholarship Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch scholarship data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});