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

    // Handle export action - always treat as binary
    if (action === "export") {
      const contentType = backendResponse.headers.get("Content-Type") || "application/octet-stream";
      const binaryData = await backendResponse.arrayBuffer();
      
      // Check if we got an error response (small size, likely JSON error)
      if (binaryData.byteLength < 500) {
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(binaryData);
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.error || errorJson.success === false) {
            return new Response(text, {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } catch {
          // Not JSON, continue with binary response
        }
      }
      
      return new Response(binaryData, {
        status: backendResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType.includes("spreadsheet") || contentType.includes("excel") 
            ? contentType 
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": backendResponse.headers.get("Content-Disposition") || 
            `attachment; filename="applications-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    // Handle list/other actions as JSON
    const responseText = await backendResponse.text();
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), {
        status: backendResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      // If JSON parse fails, return raw text with error
      return new Response(
        JSON.stringify({ success: false, error: "Invalid response from server", raw: responseText.substring(0, 200) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Applications proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
