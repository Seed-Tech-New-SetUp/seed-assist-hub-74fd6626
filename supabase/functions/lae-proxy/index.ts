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

    const body = await req.json();
    const { action, ...params } = body;

    let url: string;
    let method: string = 'GET';
    let fetchBody: string | FormData | undefined;
    let contentType: string = 'application/json';
    let isDownload = false;

    switch (action) {
      case 'assignments':
        // GET /api/assist/lae/ - List all assignments
        url = `${BASE_URL}/`;
        break;

      case 'list':
        // GET /api/assist/lae/list - List uploaded files
        const listParams = new URLSearchParams();
        if (params.page) listParams.append('page', params.page);
        if (params.limit) listParams.append('limit', params.limit);
        url = `${BASE_URL}/list${listParams.toString() ? '?' + listParams.toString() : ''}`;
        break;

      case 'upload':
        // POST /api/assist/lae/upload - Upload file
        url = `${BASE_URL}/upload`;
        method = 'POST';
        fetchBody = JSON.stringify({
          file_name: params.file_name,
          file_type: params.file_type,
          file_content: params.file_content,
          assignment_id: params.assignment_id,
        });
        break;

      case 'delete':
        // POST /api/assist/lae/delete - Delete file
        url = `${BASE_URL}/delete`;
        method = 'POST';
        fetchBody = JSON.stringify({ file_id: params.file_id });
        break;

      case 'analytics':
        // GET /api/assist/lae/analytics - Get analytics data
        const analyticsParams = new URLSearchParams();
        analyticsParams.append('assignment_id', params.assignment_id);
        if (params.status && params.status !== 'all') {
          analyticsParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          analyticsParams.append('program', params.program);
        }
        url = `${BASE_URL}/analytics?${analyticsParams.toString()}`;
        break;

      case 'detail':
        // GET /api/assist/lae/detail - Get detail records
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
        url = `${BASE_URL}/detail?${detailParams.toString()}`;
        break;

      case 'detail_export':
        // GET /api/assist/lae/detail_export - Export detail as XLSX
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
        url = `${BASE_URL}/detail_export?${exportParams.toString()}`;
        break;

      case 'analytics_export':
        // GET /api/assist/lae/analytics_export - Export analytics as XLSX (if endpoint exists)
        isDownload = true;
        const analyticsExportParams = new URLSearchParams();
        analyticsExportParams.append('assignment_id', params.assignment_id);
        if (params.status && params.status !== 'all') {
          analyticsExportParams.append('status', params.status);
        }
        if (params.program && params.program !== 'all') {
          analyticsExportParams.append('program', params.program);
        }
        url = `${BASE_URL}/analytics_export?${analyticsExportParams.toString()}`;
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

    if (method === 'POST' && !fetchBody?.toString().includes('FormData')) {
      fetchHeaders['Content-Type'] = contentType;
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

    const data = await response.json();

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
