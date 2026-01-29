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
      case "features-read":
        backendUrl = `${BACKEND_BASE_URL}/features/read.php`;
        break;
      case "features-create":
        backendUrl = `${BACKEND_BASE_URL}/features/create.php`;
        break;
      case "features-update":
        backendUrl = `${BACKEND_BASE_URL}/features/update.php`;
        break;
      case "features-delete":
        backendUrl = `${BACKEND_BASE_URL}/features/delete.php`;
        break;
      case "logos-read":
        backendUrl = `${BACKEND_BASE_URL}/logos/read.php`;
        break;
      case "logos-create":
        backendUrl = `${BACKEND_BASE_URL}/logos/create.php`;
        break;
      case "logos-update":
        backendUrl = `${BACKEND_BASE_URL}/logos/update.php`;
        break;
      case "logos-delete":
        backendUrl = `${BACKEND_BASE_URL}/logos/delete.php`;
        break;
      case "rankings-read":
        backendUrl = `${BACKEND_BASE_URL}/rankings/read.php`;
        break;
      case "rankings-create":
        backendUrl = `${BACKEND_BASE_URL}/rankings/create.php`;
        break;
      case "rankings-update":
        backendUrl = `${BACKEND_BASE_URL}/rankings/update.php`;
        break;
      case "rankings-delete":
        backendUrl = `${BACKEND_BASE_URL}/rankings/delete.php`;
        break;
      case "pocs-read":
        backendUrl = `${BACKEND_BASE_URL}/pocs/read.php`;
        break;
      case "pocs-create":
        backendUrl = `${BACKEND_BASE_URL}/pocs/create.php`;
        break;
      case "pocs-update":
        backendUrl = `${BACKEND_BASE_URL}/pocs/update.php`;
        break;
      case "pocs-delete":
        backendUrl = `${BACKEND_BASE_URL}/pocs/delete.php`;
        break;
      // Leads endpoints
      case "leads-user-data":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=get_user_data`;
        break;
      case "leads-stats":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=get_stats`;
        break;
      case "leads-programs":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=get_programs`;
        break;
      case "leads-countries":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=get_countries`;
        break;
      case "leads-list":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=get_leads`;
        break;
      case "leads-export":
        backendUrl = `${BACKEND_BASE_URL}/leads.php?action=export_leads`;
        break;
      default:
        backendUrl = `${BACKEND_BASE_URL}/update_general_info.php`;
    }

    console.log(`[school-profile-proxy] Action: ${action}, URL: ${backendUrl}, Method: ${req.method}`);

    // Check if request is FormData (for features create/update with image)
    const contentType = req.headers.get("Content-Type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    // Prepare request options
    const requestOptions: RequestInit = {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: req.headers.get("apikey") || "",
      },
    };

    // For POST/PUT requests, forward the body
    if (req.method === "POST" || req.method === "PUT") {
      if (isFormData) {
        // Forward FormData directly for file uploads
        const formData = await req.formData();
        requestOptions.body = formData;
        // Don't set Content-Type - fetch will set it with boundary
      } else {
        const body = await req.text();
        if (body) {
          requestOptions.body = body;
          (requestOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
        }
      }
    }

    const backendResponse = await fetch(backendUrl, requestOptions);

    // Log response details for debugging
    console.log(`[school-profile-proxy] Response status: ${backendResponse.status}, Content-Type: ${backendResponse.headers.get("Content-Type")}`);

    // Check response content type
    const responseContentType = backendResponse.headers.get("Content-Type") || "";

    // Handle non-JSON (HTML error pages) gracefully
    if (!responseContentType.includes("application/json")) {
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
