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
    
    // Get authorization - from header OR query param (for direct download links)
    let authHeader = req.headers.get("Authorization");
    const tokenFromQuery = url.searchParams.get("token");
    
    if (!authHeader && tokenFromQuery) {
      authHeader = `Bearer ${tokenFromQuery}`;
    }
    
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

    // Forward query params (except action and token - those are for proxy use only)
    const queryParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== "action" && key !== "token") {
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

    // Handle export action - pass through binary Excel file
    if (action === "export") {
      const contentTypeRaw = backendResponse.headers.get("Content-Type") || "";
      const contentDisposition = backendResponse.headers.get("Content-Disposition") || "";
      const contentType = contentTypeRaw.toLowerCase();

      console.log("Applications Proxy Export: backend response", {
        status: backendResponse.status,
        contentType: contentTypeRaw,
        contentDisposition,
      });

      // If backend returned JSON (error response), pass it through as error
      if (contentType.includes("application/json") || contentType.includes("text/json")) {
        const text = await backendResponse.text();
        console.log("Applications Proxy Export: JSON response (error)", text.slice(0, 200));
        return new Response(text, {
          status: backendResponse.ok ? 400 : backendResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If backend returned HTML/text (PHP error page), log full response and convert to JSON error
      if (contentType.includes("text/html") || contentType.includes("text/plain")) {
        const text = await backendResponse.text();
        console.error("Applications Proxy Export: FULL BACKEND ERROR RESPONSE:", text);
        console.error("Applications Proxy Export: Response headers:", JSON.stringify(Object.fromEntries(backendResponse.headers.entries())));
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Server returned a non-file response", 
            status: backendResponse.status,
            raw: text.slice(0, 1000) // Show more of the error
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Binary file response - pass through directly
      const binaryData = await backendResponse.arrayBuffer();
      console.log("Applications Proxy Export: Binary file received, size:", binaryData.byteLength);

      return new Response(binaryData, {
        status: backendResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": contentTypeRaw || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": contentDisposition || `attachment; filename="applications-export-${new Date().toISOString().split("T")[0]}.xlsx"`,
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
