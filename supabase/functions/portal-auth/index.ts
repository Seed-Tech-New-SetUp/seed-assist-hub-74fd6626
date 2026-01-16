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
    const action = url.searchParams.get('action') || 'login';

    if (action === 'select-school') {
      // Step 2: Select school and get final token
      const { email, school_id, tempToken } = await req.json();
      
      console.log(`Selecting school for email: ${email}, school_id: ${school_id}`);

      const response = await fetch(`${PORTAL_BASE_URL}/auth/select-school.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, school_id, tempToken }),
      });

      const data = await response.json();
      console.log(`Portal select-school response status: ${response.status}`);

      if (!response.ok || !data.success) {
        console.error('Portal select-school failed:', data);
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Failed to select school',
            error_code: 'SCHOOL_SELECT_FAILED',
            details: data 
          }),
          { status: response.status || 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'forgot-password') {
      // Request OTP for password reset
      const { email } = await req.json();
      
      console.log(`Requesting password reset OTP for email: ${email}`);

      const response = await fetch(`${PORTAL_BASE_URL}/auth/forgot-password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(`Portal forgot-password response status: ${response.status}`);

      if (!response.ok) {
        console.error('Portal forgot-password failed:', data);
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Failed to send reset code',
            error_code: data.error_code || (response.status === 404 ? 'USER_NOT_FOUND' : 'UNKNOWN'),
            details: data 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-otp') {
      // Verify OTP code
      const { email, otp } = await req.json();
      
      console.log(`Verifying OTP for email: ${email}`);

      const response = await fetch(`${PORTAL_BASE_URL}/auth/verify-otp.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log(`Portal verify-otp response status: ${response.status}`);

      if (!response.ok) {
        console.error('Portal verify-otp failed:', data);
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Invalid verification code',
            error_code: data.error_code || 'INVALID_OTP',
            details: data 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reset-password') {
      // Reset password with verified token
      const { email, otp, password, password_confirmation } = await req.json();
      
      console.log(`Resetting password for email: ${email}`);

      const response = await fetch(`${PORTAL_BASE_URL}/auth/reset-password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp, password, password_confirmation }),
      });

      const data = await response.json();
      console.log(`Portal reset-password response status: ${response.status}`);

      if (!response.ok) {
        console.error('Portal reset-password failed:', data);
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Failed to reset password',
            error_code: data.error_code || 'RESET_FAILED',
            details: data 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: Login action (Step 1)
    const { email, password } = await req.json();

    console.log(`Attempting login for email: ${email}`);

    const response = await fetch(`${PORTAL_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log(`Portal response status: ${response.status}`);
    console.log(`Portal response data:`, JSON.stringify(data));

    if (!response.ok || !data.success) {
      console.error('Portal login failed:', data);
      
      // Determine error type based on response
      let errorCode = 'LOGIN_FAILED';
      let errorMessage = data.message || 'Login failed';
      
      // Check for specific error messages from the portal
      if (response.status === 404 || 
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('does not exist') ||
          errorMessage.toLowerCase().includes('no user') ||
          errorMessage.toLowerCase().includes('user not found')) {
        errorCode = 'USER_NOT_FOUND';
        errorMessage = 'This account does not exist';
      } else if (response.status === 401 || 
                 errorMessage.toLowerCase().includes('invalid') ||
                 errorMessage.toLowerCase().includes('incorrect') ||
                 errorMessage.toLowerCase().includes('wrong password') ||
                 errorMessage.toLowerCase().includes('credentials')) {
        errorCode = 'INVALID_CREDENTIALS';
        errorMessage = 'Invalid email or password';
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          error_code: errorCode,
          details: data 
        }),
        { status: response.status || 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Portal login successful');

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in portal-auth:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, error_code: 'SERVER_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
