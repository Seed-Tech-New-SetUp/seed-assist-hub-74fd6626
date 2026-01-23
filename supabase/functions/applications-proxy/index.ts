import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const BACKEND_BASE_URL = "https://seedglobaleducation.com/api/assist/university-applications";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build backend URL based on action
    let backendUrl = BACKEND_BASE_URL;
    
    switch (action) {
      case "list":
        backendUrl = `${BACKEND_BASE_URL}/index.php`;
        break;
      case "export":
        backendUrl = `${BACKEND_BASE_URL}/download.php`;
        break;
      default:
        backendUrl = `${BACKEND_BASE_URL}/index.php`;
    }

    // Forward query params (except action)
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== "action") {
        queryParams.append(key, value);
      }
    });
    
    if (queryParams.toString()) {
      backendUrl += `?${queryParams.toString()}`;
    }

    console.log("Applications Proxy: Fetching from", backendUrl);

    // Forward request to backend
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? await req.text() : undefined,
    });

    // Handle binary export response
    if (action === "export") {
      const contentType = backendResponse.headers.get("Content-Type") || "";
      if (contentType.includes("spreadsheet") || contentType.includes("octet-stream")) {
        const binaryData = await backendResponse.arrayBuffer();
        return new Response(binaryData, {
          status: backendResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Disposition": backendResponse.headers.get("Content-Disposition") || 
              `attachment; filename="applications-export.xlsx"`,
          },
        });
      }
    }

    const data = await backendResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Applications proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
