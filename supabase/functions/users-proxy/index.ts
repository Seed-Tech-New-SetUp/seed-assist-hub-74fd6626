import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PORTAL_BASE_URL = "https://seedglobaleducation.com/api/assist";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required', error_code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Helper to safely parse JSON responses
    const safeParseJson = async (response: Response, context: string): Promise<Response> => {
      const contentType = response.headers.get('Content-Type') || '';
      const rawText = await response.text();
      
      let data: unknown;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error(`Users Proxy (${context}): Non-JSON response`, {
          status: response.status,
          contentType,
          snippet: rawText.slice(0, 500),
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Backend returned non-JSON response',
            error_code: 'PARSE_ERROR',
            status: response.status,
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify(data),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    };

    if (action === 'list') {
      // Fetch users list
      console.log('Fetching users list');

      const response = await fetch(`${PORTAL_BASE_URL}/users/index.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
        },
      });

      console.log(`Users list response status: ${response.status}`);
      return safeParseJson(response, 'list');
    }

    if (action === 'invite') {
      // Invite new user
      const body = await req.json();
      console.log('Inviting user:', body.email);

      const response = await fetch(`${PORTAL_BASE_URL}/users/invite_user.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(body),
      });

      console.log(`Invite user response status: ${response.status}`);
      return safeParseJson(response, 'invite');
    }

    if (action === 'delete-invitation') {
      // Delete invitation
      const invitationId = url.searchParams.get('id');
      
      if (!invitationId) {
        return new Response(
          JSON.stringify({ error: 'Missing invitation ID', error_code: 'MISSING_ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Deleting invitation:', invitationId);

      const response = await fetch(`${PORTAL_BASE_URL}/users/delete_invitation.php?id=${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
        },
      });

      console.log(`Delete invitation response status: ${response.status}`);
      return safeParseJson(response, 'delete-invitation');
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action', error_code: 'INVALID_ACTION' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in users-proxy:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, error_code: 'SERVER_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
