import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://seedglobaleducation.com/api/assist/lae';

serve(async (req) => {
  // Handle CORS preflight
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

    const contentType = req.headers.get('Content-Type') || '';
    
    // Handle multipart/form-data for file uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const action = formData.get('action');
      
      if (action === 'upload') {
        const url = `${BASE_URL}/upload.php`;
        
        // Forward the FormData directly to the backend
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
          },
          body: formData,
        });
        
        const respContentType = response.headers.get('Content-Type') || '';
        const responseText = await response.text();
        
        if (!respContentType.includes('application/json')) {
          console.error('LAE Proxy Upload: Non-JSON response:', responseText.substring(0, 500));
          return new Response(
            JSON.stringify({ success: false, error: 'Backend returned non-JSON response' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        try {
          const data = JSON.parse(responseText);
          return new Response(
            JSON.stringify(data),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (parseError) {
          console.error('LAE Proxy Upload: JSON parse error:', parseError);
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid JSON response from backend' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    const body = await req.json();
    const { action, ...params } = body;

    let url: string;
    let method: string = 'GET';
    let fetchBody: string | undefined;
    let isDownload = false;

    switch (action) {
      case 'assignments':
        // GET /api/assist/lae/index.php - List all assignments
        url = `${BASE_URL}/index.php`;
        break;

      case 'list':
        // GET /api/assist/lae/list.php - List uploaded files
        const listParams = new URLSearchParams();
        if (params.page) listParams.append('page', params.page);
        if (params.limit) listParams.append('limit', params.limit);
        url = `${BASE_URL}/list.php${listParams.toString() ? '?' + listParams.toString() : ''}`;
        break;

      case 'delete':
        // POST /api/assist/lae/delete.php - Delete file
        url = `${BASE_URL}/delete.php`;
        method = 'POST';
        fetchBody = JSON.stringify({ file_id: params.file_id });
        break;

      case 'analytics':
        // GET /api/assist/lae/analytics.php - Get analytics data
        const analyticsParams = new URLSearchParams();
        analyticsParams.append('assignment_id', params.assignment_id);
        if (params.status && params.status !== 'all') {
          analyticsParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          analyticsParams.append('program', params.program);
        }
        url = `${BASE_URL}/analytics.php?${analyticsParams.toString()}`;
        break;

      case 'detail':
        // GET /api/assist/lae/detail.php - Get detail records
        const detailParams = new URLSearchParams();
        detailParams.append('assignment_id', params.assignment_id);
        detailParams.append('filter_type', params.filter_type);
        if (Array.isArray(params.filter_values)) {
          detailParams.append('filter_value', params.filter_values.join(','));
        } else {
          detailParams.append('filter_value', params.filter_values || '');
        }
        if (params.multiple) detailParams.append('multiple', '1');
        if (params.status && params.status !== 'all') {
          detailParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          detailParams.append('program', params.program);
        }
        url = `${BASE_URL}/detail.php?${detailParams.toString()}`;
        break;

      case 'detail_export':
        // GET /api/assist/lae/detail_export.php - Export detail as XLSX
        isDownload = true;
        const exportParams = new URLSearchParams();
        exportParams.append('assignment_id', params.assignment_id);
        exportParams.append('filter_type', params.filter_type);
        if (Array.isArray(params.filter_values)) {
          exportParams.append('filter_value', params.filter_values.join(','));
        } else {
          exportParams.append('filter_value', params.filter_values || '');
        }
        if (params.multiple) exportParams.append('multiple', '1');
        if (params.status && params.status !== 'all') {
          exportParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          exportParams.append('program', params.program);
        }
        url = `${BASE_URL}/detail_export.php?${exportParams.toString()}`;
        break;

      case 'analytics_export':
        // GET /api/assist/lae/analytics_export.php - Export analytics as XLSX
        isDownload = true;
        const analyticsExportParams = new URLSearchParams();
        analyticsExportParams.append('assignment_id', params.assignment_id);
        if (params.status && params.status !== 'all') {
          analyticsExportParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          analyticsExportParams.append('program', params.program);
        }
        url = `${BASE_URL}/analytics_export.php?${analyticsExportParams.toString()}`;
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`LAE Proxy: ${method} ${url}`);

    const fetchHeaders: Record<string, string> = {
      'Authorization': authHeader,
    };

    if (method === 'POST') {
      fetchHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: fetchBody,
    });

    if (isDownload) {
      // For file downloads, return the binary data
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      return new Response(arrayBuffer, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="export.xlsx"',
        },
      });
    }

    // Check content type before parsing
    const respContentType = response.headers.get('Content-Type') || '';
    const responseText = await response.text();

    // Handle non-JSON responses (e.g., HTML error pages)
    if (!respContentType.includes('application/json')) {
      console.error('LAE Proxy: Non-JSON response received:', responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Backend returned non-JSON response (status: ${response.status})`,
          assignments: [],
          files: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      console.log('LAE Proxy: Empty response received');
      return new Response(
        JSON.stringify({ 
          success: true, 
          assignments: [],
          files: [],
          message: 'No data available'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
      
      // Handle nested response structure for assignments endpoint
      if (action === 'assignments' && data?.data?.assignments) {
        // Map the backend response to expected frontend format
        const mappedAssignments = data.data.assignments.map((a: Record<string, unknown>) => ({
          assignment_id: a.assignment_id,
          assignment_type: a.assignment_type,
          cycle: a.cycle || null,
          start_date: a.created_at || null,
          status: 'active', // Default status since backend doesn't provide it
          view_name: a.view_name
        }));
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            assignments: mappedAssignments,
            total: data.data.total || mappedAssignments.length
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle nested response structure for analytics endpoint
      if (action === 'analytics' && data?.success && data?.data) {
        const analyticsData = data.data;
        return new Response(
          JSON.stringify({ 
            success: true,
            total_records: analyticsData.total_records || 0,
            columns: analyticsData.columns || { status_column: null, program_column: null },
            filters: analyticsData.filters || { statuses: [], programs: [] },
            status_distribution: analyticsData.status_distribution || [],
            status_total: analyticsData.status_total || 0,
            program_distribution: analyticsData.program_distribution || [],
            program_total: analyticsData.program_total || 0,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle nested response structure for detail endpoint
      if (action === 'detail' && data?.success && data?.data) {
        const detailData = data.data;
        return new Response(
          JSON.stringify({ 
            success: true,
            data: detailData.data || [],
            columns: detailData.columns || [],
            headers: detailData.headers || null,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error('LAE Proxy: JSON parse error:', parseError, 'Response:', responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON response from backend',
          assignments: [],
          files: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('LAE Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process LAE request';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});