import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BACKEND_BASE_URL = "https://seedglobaleducation.com/api/assist/programs";

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

    // Route to appropriate PHP endpoint based on action
    switch (action) {
      case "list":
        // List all programs for the school
        backendUrl = `${BACKEND_BASE_URL}/list.php`;
        break;
      case "info":
        // Get/update program information
        backendUrl = `${BACKEND_BASE_URL}/update_program_information.php?program_id=${programId}`;
        break;
      case "features":
        // Get/update program features (USP)
        backendUrl = `${BACKEND_BASE_URL}/add_program_usp.php?program_id=${programId}`;
        break;
      case "members":
        // Get/update program members (faculty, students, alumni)
        backendUrl = `${BACKEND_BASE_URL}/update_program_member.php?program_id=${programId}&category=${category}`;
        break;
      case "rankings":
        // Get/update program rankings
        backendUrl = `${BACKEND_BASE_URL}/update_program_rankings.php?program_id=${programId}&level=${level || "Program"}`;
        break;
      case "recruiters":
        // Get/update program recruiters
        backendUrl = `${BACKEND_BASE_URL}/update_program_recruiters.php?program_id=${programId}`;
        break;
      case "jobroles":
        // Get/update program job roles
        backendUrl = `${BACKEND_BASE_URL}/update_program_job_roles.php?program_id=${programId}`;
        break;
      case "faqs":
        // Get/update program FAQs
        backendUrl = `${BACKEND_BASE_URL}/update_program_faqs.php?program_id=${programId}`;
        break;
      case "pocs":
        // Get/update program points of contact
        backendUrl = `${BACKEND_BASE_URL}/update_program_poc.php?program_id=${programId}`;
        break;
      case "ranking-orgs":
        // Get ranking organizations list
        backendUrl = `${BACKEND_BASE_URL}/ranking_organizations.php`;
        break;
      default:
        backendUrl = `${BACKEND_BASE_URL}/list.php`;
    }

    console.log(`[programs-proxy] Action: ${action}, URL: ${backendUrl}, Method: ${req.method}`);

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

    // Check content type
    const contentType = backendResponse.headers.get("Content-Type") || "";

    // Handle non-JSON (HTML error pages) gracefully
    if (!contentType.includes("application/json")) {
      const textBody = await backendResponse.text();
      console.error(`[programs-proxy] Non-JSON response: ${textBody.substring(0, 500)}`);
      
      // Return empty safe state
      if (action === "list") {
        return new Response(
          JSON.stringify({ success: true, data: { programs: [] } }),
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
