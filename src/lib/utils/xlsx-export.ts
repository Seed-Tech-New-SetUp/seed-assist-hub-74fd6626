import * as XLSX from 'xlsx';

interface ExportOptions {
  filename: string;
  sheetName?: string;
}

/**
 * Export data to XLSX format
 * @param data Array of objects to export
 * @param options Export options including filename and optional sheet name
 */
export function exportToXLSX<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions
): void {
  const { filename, sheetName = 'Sheet1' } = options;
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] ?? '').length)
    ) + 2
  }));
  worksheet['!cols'] = colWidths;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate and download file
  const xlsxFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, xlsxFilename);
}

/**
 * Export multiple sheets to a single XLSX file
 * @param sheets Array of sheet configurations with data and names
 * @param filename Output filename
 */
export function exportMultipleSheetsToXLSX<T extends Record<string, unknown>>(
  sheets: Array<{ data: T[]; sheetName: string }>,
  filename: string
): void {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    if (data.length > 0) {
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(
          key.length,
          ...data.map(row => String(row[key] ?? '').length)
        ) + 2
      }));
      worksheet['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  const xlsxFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, xlsxFilename);
}
