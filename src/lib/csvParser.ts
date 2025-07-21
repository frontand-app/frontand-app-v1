import Papa from 'papaparse';

export interface ParsedCSVData {
  headers: string[];
  rows: any[][];
  meta: {
    fields?: string[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

export interface CSVParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
  preview?: number; // Number of rows to preview
}

/**
 * Parse CSV file and return structured data suitable for sending to Modal endpoints
 */
export const parseCSVFile = (file: File, options: CSVParseOptions = {}): Promise<ParsedCSVData> => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      header: false, // We'll handle headers manually for better control
      skipEmptyLines: true,
      delimiter: '', // Auto-detect
      complete: (results: Papa.ParseResult<any>) => {
        try {
          const data = results.data as string[][];
          
          // Remove empty rows
          const filteredData = data.filter(row => 
            row.some(cell => cell && cell.toString().trim() !== '')
          );
          
          if (filteredData.length === 0) {
            reject(new Error('CSV file appears to be empty'));
            return;
          }
          
          // Extract headers from first row
          const headers = filteredData[0].map(header => 
            header ? header.toString().trim() : ''
          );
          
          // Extract data rows (skip first row which contains headers)
          const rows = filteredData.slice(1).map(row => 
            row.map(cell => {
              // Try to parse numbers, booleans, or keep as string
              const trimmed = cell ? cell.toString().trim() : '';
              
              // Check for boolean
              if (trimmed.toLowerCase() === 'true') return true;
              if (trimmed.toLowerCase() === 'false') return false;
              
              // Check for number
              if (trimmed !== '' && !isNaN(Number(trimmed))) {
                return Number(trimmed);
              }
              
              // Keep as string
              return trimmed;
            })
          );
          
          resolve({
            headers,
            rows,
            meta: results.meta
          });
        } catch (error) {
          reject(new Error(`Error processing CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
      ...options
    };
    
    Papa.parse(file, defaultOptions);
  });
};

/**
 * Preview CSV file (first few rows) for user validation
 */
export const previewCSVFile = (file: File, previewRows: number = 5): Promise<ParsedCSVData> => {
  return parseCSVFile(file, { preview: previewRows + 1 }); // +1 for headers
};

/**
 * Convert parsed CSV data to the format expected by Modal endpoints
 */
export const formatCSVForModal = (parsedData: ParsedCSVData) => {
  return {
    csv_data: {
      headers: parsedData.headers,
      rows: parsedData.rows,
      meta: {
        total_rows: parsedData.rows.length,
        total_columns: parsedData.headers.length,
        delimiter: parsedData.meta.delimiter
      }
    }
  };
};

/**
 * Validate CSV file before processing
 */
export const validateCSVFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['text/csv', 'application/csv', 'text/plain'];
  const validExtensions = ['.csv', '.txt'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidType && !hasValidExtension) {
    return {
      isValid: false,
      error: 'File must be a CSV file (.csv extension)'
    };
  }
  
  // Check file size (limit to 10MB for frontend processing)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'CSV file too large. Maximum size is 10MB for frontend processing.'
    };
  }
  
  return { isValid: true };
}; 