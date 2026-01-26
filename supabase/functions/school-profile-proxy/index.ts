import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BACKEND_BASE_URL = "https://seedglobaleducation.com/api/assist/school-profile";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "info";

    // Get auth token from header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let backendUrl: string;

    // Route to appropriate PHP endpoint based on action
    switch (action) {
      case "info":
        backendUrl = `${BACKEND_BASE_URL}/info.php`;
        break;
      case "social":
        backendUrl = `${BACKEND_BASE_URL}/social_media.php`;
        break;
      case "faqs":
        backendUrl = `${BACKEND_BASE_URL}/faqs.php`;
        break;
      case "features":
        backendUrl = `${BACKEND_BASE_URL}/update_school_features.php`;
        break;
      case "logos":
        backendUrl = `${BACKEND_BASE_URL}/update_logos.php`;
        break;
      case "rankings":
        backendUrl = `${BACKEND_BASE_URL}/update_school_rankings.php`;
        break;
      case "pocs":
        backendUrl = `${BACKEND_BASE_URL}/update_school_poc.php`;
        break;
      default:
        backendUrl = `${BACKEND_BASE_URL}/update_general_info.php`;
    }

    console.log(`[school-profile-proxy] Action: ${action}, URL: ${backendUrl}, Method: ${req.method}`);

    // Prepare request options
    const requestOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: req.headers.get("apikey") || "",
      },
    };

    // For POST/PUT requests, forward the body
    if (req.method === "POST" || req.method === "PUT") {
      const body = await req.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    const backendResponse = await fetch(backendUrl, requestOptions);

    // Log response details for debugging
    console.log(`[school-profile-proxy] Response status: ${backendResponse.status}, Content-Type: ${backendResponse.headers.get("Content-Type")}`);

    // Check content type
    const contentType = backendResponse.headers.get("Content-Type") || "";

    // Handle non-JSON (HTML error pages) gracefully
    if (!contentType.includes("application/json")) {
      const textBody = await backendResponse.text();
      console.error(`[school-profile-proxy] Non-JSON response (status ${backendResponse.status}): ${textBody.substring(0, 1000)}`);

      // Return empty safe state based on action
      if (action === "faqs") {
        return new Response(JSON.stringify({ success: true, data: { faqs: [], count: 0 } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: false, error: `Backend returned non-JSON response (status ${backendResponse.status})` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await backendResponse.json();
    console.log(`[school-profile-proxy] Response status: ${backendResponse.status}`);

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[school-profile-proxy] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
