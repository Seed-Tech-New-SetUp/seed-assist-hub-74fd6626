import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BACKEND_BASE_URL = "https://seedglobaleducation.com/api/assist";
const PROGRAMS_BASE_URL = `${BACKEND_BASE_URL}/programs`;
const PROGRAM_PROFILE_URL = `${BACKEND_BASE_URL}/program-profile`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";
    const programId = url.searchParams.get("program_id");
    const category = url.searchParams.get("category");
    const level = url.searchParams.get("level");

    // Get auth token from header
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let backendUrl: string;
    let isFormData = false;

    // Route to appropriate PHP endpoint based on action
    switch (action) {
      case "list":
        backendUrl = PROGRAM_PROFILE_URL;
        break;
      case "info":
        backendUrl = `${PROGRAM_PROFILE_URL}/info.php?program_id=${programId}`;
        break;
      case "features":
        backendUrl = `${PROGRAM_PROFILE_URL}/features/read.php?program_id=${programId}`;
        break;
      case "features-create":
        backendUrl = `${PROGRAM_PROFILE_URL}/features/create.php`;
        isFormData = true;
        break;
      case "features-update":
        backendUrl = `${PROGRAM_PROFILE_URL}/features/update.php`;
        // Check content-type to determine if it's form-data or JSON
        isFormData = req.headers.get("content-type")?.includes("multipart/form-data") || false;
        break;
      case "features-delete":
        backendUrl = `${PROGRAM_PROFILE_URL}/features/delete.php`;
        break;
      // Members CRUD
      case "members":
        backendUrl = `${PROGRAM_PROFILE_URL}/members/read.php?program_id=${programId}&category=${category}`;
        break;
      case "members-create":
        backendUrl = `${PROGRAM_PROFILE_URL}/members/create.php`;
        isFormData = true;
        break;
      case "members-update":
        backendUrl = `${PROGRAM_PROFILE_URL}/members/update.php`;
        isFormData = req.headers.get("content-type")?.includes("multipart/form-data") || false;
        break;
      case "members-delete":
        backendUrl = `${PROGRAM_PROFILE_URL}/members/delete.php`;
        break;
      case "rankings":
        backendUrl = `${PROGRAMS_BASE_URL}/update_program_rankings.php?program_id=${programId}&level=${level || "Program"}`;
        break;
      case "recruiters":
        backendUrl = `${PROGRAMS_BASE_URL}/update_program_recruiters.php?program_id=${programId}`;
        break;
      case "jobroles":
        backendUrl = `${PROGRAMS_BASE_URL}/update_program_job_roles.php?program_id=${programId}`;
        break;
      case "faqs":
        backendUrl = `${PROGRAMS_BASE_URL}/update_program_faqs.php?program_id=${programId}`;
        break;
      case "pocs":
        backendUrl = `${PROGRAMS_BASE_URL}/update_program_poc.php?program_id=${programId}`;
        break;
      case "ranking-orgs":
        backendUrl = `${PROGRAMS_BASE_URL}/ranking_organizations.php`;
        break;
      default:
        backendUrl = PROGRAM_PROFILE_URL;
    }

    console.log(`[programs-proxy] Action: ${action}, URL: ${backendUrl}, Method: ${req.method}, FormData: ${isFormData}`);

    // Prepare request options
    const requestHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      apikey: req.headers.get("apikey") || "",
    };

    // Only set Content-Type for non-form-data requests
    if (!isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const requestOptions: RequestInit = {
      method: req.method,
      headers: requestHeaders,
    };

    // For POST/PUT requests, forward the body
    if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
      if (isFormData) {
        // Forward form data as-is (the browser handles boundaries)
        const formData = await req.formData();
        requestOptions.body = formData;
      } else {
        const body = await req.text();
        if (body) {
          requestOptions.body = body;
        }
      }
    }

    const backendResponse = await fetch(backendUrl, requestOptions);

    // Check content type
    const contentType = backendResponse.headers.get("Content-Type") || "";

    // Handle non-JSON (HTML error pages) gracefully
    if (!contentType.includes("application/json")) {
      const textBody = await backendResponse.text();
      console.error(`[programs-proxy] Non-JSON response: ${textBody.substring(0, 500)}`);
      
      // Return empty safe state for list actions
      if (action === "list") {
        return new Response(
          JSON.stringify({ success: true, data: { programs: [] } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (action === "features") {
        return new Response(
          JSON.stringify({ success: true, data: { features: [] } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Backend returned non-JSON response", data: null }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await backendResponse.json();

    console.log(`[programs-proxy] Response status: ${backendResponse.status}`);

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[programs-proxy] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
