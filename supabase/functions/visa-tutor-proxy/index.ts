import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://seedglobaleducation.com/api/assist/visa-tutor';

serve(async (req) => {
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
    let method = req.method === 'OPTIONS' ? 'GET' : req.method;
    let body: BodyInit | null = null;
    const headers: Record<string, string> = {
      'Authorization': authHeader,
    };

    switch (action) {
      // ─── License Endpoints (read-only) ───
      case 'list': {
        const params = new URLSearchParams();
        const search = url.searchParams.get('search');
        const limit = url.searchParams.get('limit') || '20';
        const page = url.searchParams.get('page') || '1';
        if (search) params.append('search', search);
        params.append('limit', limit);
        params.append('page', page);
        apiUrl = `${BASE_URL}/?${params.toString()}`;
        method = 'GET';
        break;
      }

      case 'license_details': {
        const licenseNumber = url.searchParams.get('license_number');
        if (!licenseNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'license_number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${BASE_URL}/license_details.php?license_number=${encodeURIComponent(licenseNumber)}`;
        method = 'GET';
        break;
      }

      case 'session_details': {
        const licenseNumber = url.searchParams.get('license_number');
        if (!licenseNumber) {
          return new Response(
            JSON.stringify({ success: false, error: 'license_number is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const params = new URLSearchParams({ license_number: licenseNumber });
        const sessionId = url.searchParams.get('session_id');
        if (sessionId) params.append('session_id', sessionId);
        apiUrl = `${BASE_URL}/session_details.php?${params.toString()}`;
        method = 'GET';
        break;
      }

      // ─── Allocation Endpoints ───
      case 'allocations': {
        if (method === 'GET') {
          // List allocations
          const params = new URLSearchParams();
          const search = url.searchParams.get('search');
          const consent = url.searchParams.get('consent');
          const puid = url.searchParams.get('puid');
          const limit = url.searchParams.get('limit') || '100';
          const offset = url.searchParams.get('offset') || '0';
          if (search) params.append('search', search);
          if (consent) params.append('consent', consent);
          if (puid) params.append('puid', puid);
          params.append('limit', limit);
          params.append('offset', offset);
          apiUrl = `${BASE_URL}/allocations.php?${params.toString()}`;
        } else if (method === 'POST') {
          // Create allocation
          apiUrl = `${BASE_URL}/allocations.php`;
          headers['Content-Type'] = 'application/json';
          body = await req.text();
        } else {
          return new Response(
            JSON.stringify({ success: false, error: `Method ${method} not allowed for allocations` }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
      }

      case 'allocation': {
        if (method === 'GET') {
          // Get allocation detail
          const licenseNo = url.searchParams.get('license_no');
          if (!licenseNo) {
            return new Response(
              JSON.stringify({ success: false, error: 'license_no is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          apiUrl = `${BASE_URL}/allocation.php?license_no=${encodeURIComponent(licenseNo)}`;
        } else if (method === 'PUT') {
          // Update allocation
          apiUrl = `${BASE_URL}/allocation.php`;
          headers['Content-Type'] = 'application/json';
          body = await req.text();
        } else {
          return new Response(
            JSON.stringify({ success: false, error: `Method ${method} not allowed for allocation` }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
      }

      case 'allocations_bulk': {
        if (method !== 'POST') {
          return new Response(
            JSON.stringify({ success: false, error: 'POST method required for bulk allocations' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${BASE_URL}/allocations_bulk.php`;
        headers['Content-Type'] = 'application/json';
        body = await req.text();
        break;
      }

      // ─── Stats Dashboard ───
      case 'stats': {
        const params = new URLSearchParams();
        const puid = url.searchParams.get('puid');
        if (puid) params.append('puid', puid);
        apiUrl = `${BASE_URL}/stats.php${params.toString() ? '?' + params.toString() : ''}`;
        method = 'GET';
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const response = await fetch(apiUrl, {
      method,
      headers,
      body,
    });

    // Handle binary responses
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/vnd.openxmlformats') ||
        contentType.includes('application/octet-stream')) {
      const blob = await response.blob();
      return new Response(blob, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
        },
      });
    }

    // Safe JSON parsing
    const rawText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      const snippet = rawText.slice(0, 600);
      console.error('Visa Tutor Proxy Upstream Non-JSON Response', {
        apiUrl, status: response.status, contentType, snippet,
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Upstream returned non-JSON response',
          upstream: { url: apiUrl, status: response.status, contentType, body_snippet: snippet },
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Visa Tutor Proxy Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process visa tutor request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
